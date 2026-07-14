const authService = require('./auth.service');
const { sendSuccess } = require('../../shared/helpers/response.helper');
const { toRegisterUserResponse, toAuthUserResponse } = require('./auth.mapper');
const { COOKIE_NAME } = require('./auth.constants');
const { COOKIE_OPTIONS, REFRESH_TOKEN_TTL_MS } = require('../sessions/session.constants');

function getRequestMeta(req) {
  return { userAgent: req.get('user-agent') || '', ipAddress: req.ip };
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(COOKIE_NAME, refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_TTL_MS });
}

function clearRefreshCookie(res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
}

async function register(req, res) {
  const user = await authService.register(req.body, getRequestMeta(req));

  sendSuccess(res, {
    statusCode: 201,
    data: { user: toRegisterUserResponse(user) },
    message: 'Cuenta creada. Revisa tu correo para verificarla.',
  });
}

async function verifyEmail(req, res) {
  await authService.verifyEmail(req.body);

  sendSuccess(res, { message: 'Correo verificado correctamente' });
}

async function resendVerification(req, res) {
  await authService.resendVerification(req.body);

  sendSuccess(res, { message: 'Si la cuenta requiere verificación, enviaremos un nuevo enlace.' });
}

async function login(req, res) {
  const { accessToken, refreshToken, user } = await authService.login(req.body, getRequestMeta(req));

  setRefreshCookie(res, refreshToken);

  sendSuccess(res, {
    data: { accessToken, user: toAuthUserResponse(user) },
    message: 'Inicio de sesión exitoso',
  });
}

async function refresh(req, res) {
  const rawRefreshToken = req.cookies[COOKIE_NAME];
  const { accessToken, refreshToken } = await authService.refresh(rawRefreshToken, getRequestMeta(req));

  setRefreshCookie(res, refreshToken);

  sendSuccess(res, { data: { accessToken }, message: 'Sesión renovada' });
}

async function logout(req, res) {
  const rawRefreshToken = req.cookies[COOKIE_NAME];
  await authService.logout(rawRefreshToken);

  clearRefreshCookie(res);

  sendSuccess(res, { message: 'Sesión cerrada' });
}

async function logoutAll(req, res) {
  await authService.logoutAll(req.user._id);

  clearRefreshCookie(res);

  sendSuccess(res, { message: 'Todas las sesiones fueron cerradas' });
}

async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body, getRequestMeta(req));

  sendSuccess(res, { message: 'Si existe una cuenta asociada, enviaremos instrucciones.' });
}

async function resetPassword(req, res) {
  await authService.resetPassword(req.body);

  sendSuccess(res, { message: 'Contraseña actualizada. Inicia sesión nuevamente.' });
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
