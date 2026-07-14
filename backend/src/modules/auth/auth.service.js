const userRepository = require('../users/user.repository');
const sessionService = require('../sessions/session.service');
const userTokenService = require('../tokens/userToken.service');
const emailService = require('../notifications/email/email.service');
const auditService = require('../audit/audit.service');
const { hashPassword, verifyPassword } = require('../../shared/utils/password.util');
const { signAccessToken } = require('./auth.tokens');
const { AppError } = require('../../shared/errors/AppError');
const { ROLES } = require('../../shared/constants/roles');
const { USER_STATUS } = require('../../shared/constants/userStatus');
const { TOKEN_TYPES } = require('../../shared/constants/tokenTypes');
const { AUDIT_ACTIONS } = require('../../shared/constants/auditActions');
const { MAX_FAILED_ATTEMPTS, LOCK_MINUTES } = require('./auth.constants');

function assertPasswordsMatch(password, passwordConfirmation) {
  if (password !== passwordConfirmation) {
    throw new AppError('PASSWORDS_DO_NOT_MATCH', 'Las contraseñas no coinciden');
  }
}

async function register({ firstName, lastName, email, phone, password, passwordConfirmation }, meta = {}) {
  assertPasswordsMatch(password, passwordConfirmation);

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AppError('EMAIL_ALREADY_REGISTERED', 'El email ya está registrado');
  }

  const passwordHash = await hashPassword(password);

  const user = await userRepository.createUser({
    firstName,
    lastName,
    email,
    phone: phone || '',
    passwordHash,
    role: ROLES.CUSTOMER,
    status: USER_STATUS.PENDING_VERIFICATION,
    emailVerified: false,
  });

  const rawToken = await userTokenService.issueToken(user._id, TOKEN_TYPES.EMAIL_VERIFICATION);
  await emailService.sendVerificationEmail(user, rawToken);

  await auditService.record({
    actorId: user._id,
    action: AUDIT_ACTIONS.USER_REGISTERED,
    targetType: 'User',
    targetId: user._id,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return user;
}

async function verifyEmail({ token }) {
  const tokenDoc = await userTokenService.consumeToken(token, TOKEN_TYPES.EMAIL_VERIFICATION, {
    invalidTokenCode: 'INVALID_VERIFICATION_TOKEN',
    expiredTokenCode: 'EXPIRED_VERIFICATION_TOKEN',
  });

  const user = await userRepository.findById(tokenDoc.userId);
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'Usuario no encontrado');
  }

  const nextStatus = user.status === USER_STATUS.PENDING_VERIFICATION ? USER_STATUS.ACTIVE : user.status;

  const updatedUser = await userRepository.updateById(user._id, {
    emailVerified: true,
    emailVerifiedAt: new Date(),
    status: nextStatus,
  });

  await auditService.record({
    actorId: user._id,
    action: AUDIT_ACTIONS.EMAIL_VERIFIED,
    targetType: 'User',
    targetId: user._id,
  });

  return updatedUser;
}

async function resendVerification({ email }) {
  const user = await userRepository.findByEmail(email);

  if (user && !user.emailVerified) {
    const rawToken = await userTokenService.issueToken(user._id, TOKEN_TYPES.EMAIL_VERIFICATION);
    await emailService.sendVerificationEmail(user, rawToken);
  }
}

async function login({ email, password }, meta = {}) {
  const user = await userRepository.findByEmail(email, { withPassword: true });

  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
  }

  if (user.status === USER_STATUS.BLOCKED) {
    throw new AppError('ACCOUNT_BLOCKED', 'Tu cuenta está bloqueada');
  }

  if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
    throw new AppError('ACCOUNT_TEMPORARILY_LOCKED', 'Tu cuenta está bloqueada temporalmente, inténtalo más tarde');
  }

  const passwordValid = await verifyPassword(user.passwordHash, password);

  if (!passwordValid) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    const update = { failedLoginAttempts };

    if (failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      update.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
    }

    await userRepository.updateById(user._id, update);
    await auditService.record({
      actorId: user._id,
      action: AUDIT_ACTIONS.USER_LOGIN_FAILED,
      targetType: 'User',
      targetId: user._id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    throw new AppError('INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
  }

  if (user.status === USER_STATUS.PENDING_VERIFICATION) {
    throw new AppError('EMAIL_NOT_VERIFIED', 'Debes verificar tu correo antes de iniciar sesión');
  }

  await userRepository.updateById(user._id, {
    failedLoginAttempts: 0,
    lockUntil: null,
    lastLoginAt: new Date(),
  });

  const accessToken = signAccessToken(user);
  const { rawToken: refreshToken } = await sessionService.createSession(user._id, meta);

  await auditService.record({
    actorId: user._id,
    action: AUDIT_ACTIONS.USER_LOGIN_SUCCESS,
    targetType: 'User',
    targetId: user._id,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { accessToken, refreshToken, user };
}

async function refresh(rawRefreshToken, meta = {}) {
  const { rawToken: refreshToken, userId } = await sessionService.rotateSession(rawRefreshToken, meta);

  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError('INVALID_REFRESH_TOKEN', 'Refresh token inválido');
  }

  if (user.status === USER_STATUS.BLOCKED) {
    await sessionService.revokeAllForUser(user._id);
    throw new AppError('ACCOUNT_BLOCKED', 'Tu cuenta está bloqueada');
  }

  const accessToken = signAccessToken(user);

  return { accessToken, refreshToken };
}

async function logout(rawRefreshToken) {
  const session = await sessionService.revokeByRawToken(rawRefreshToken);

  await auditService.record({
    actorId: session ? session.userId : null,
    action: AUDIT_ACTIONS.USER_LOGOUT,
    targetType: 'User',
    targetId: session ? session.userId : null,
  });
}

async function logoutAll(userId) {
  await sessionService.revokeAllForUser(userId);

  await auditService.record({
    actorId: userId,
    action: AUDIT_ACTIONS.USER_LOGOUT_ALL,
    targetType: 'User',
    targetId: userId,
  });
}

async function forgotPassword({ email }, meta = {}) {
  const user = await userRepository.findByEmail(email);

  if (user) {
    const rawToken = await userTokenService.issueToken(user._id, TOKEN_TYPES.PASSWORD_RESET);
    await emailService.sendPasswordResetEmail(user, rawToken);

    await auditService.record({
      actorId: user._id,
      action: AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED,
      targetType: 'User',
      targetId: user._id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  }
}

async function resetPassword({ token, password, passwordConfirmation }) {
  assertPasswordsMatch(password, passwordConfirmation);

  const tokenDoc = await userTokenService.consumeToken(token, TOKEN_TYPES.PASSWORD_RESET, {
    invalidTokenCode: 'INVALID_RESET_TOKEN',
    expiredTokenCode: 'EXPIRED_RESET_TOKEN',
  });

  const user = await userRepository.findById(tokenDoc.userId);
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'Usuario no encontrado');
  }

  const passwordHash = await hashPassword(password);

  await userRepository.updateById(user._id, {
    passwordHash,
    passwordChangedAt: new Date(),
  });

  await sessionService.revokeAllForUser(user._id);

  await auditService.record({
    actorId: user._id,
    action: AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED,
    targetType: 'User',
    targetId: user._id,
  });
}

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
};
