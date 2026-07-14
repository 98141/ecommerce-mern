const userRepository = require('./user.repository');
const sessionService = require('../sessions/session.service');
const auditService = require('../audit/audit.service');
const { hashPassword, verifyPassword } = require('../../shared/utils/password.util');
const { AppError } = require('../../shared/errors/AppError');
const { USER_STATUS } = require('../../shared/constants/userStatus');
const { AUDIT_ACTIONS } = require('../../shared/constants/auditActions');

async function getProfile(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'Usuario no encontrado');
  }

  return user;
}

async function updateProfile(userId, updates) {
  const user = await userRepository.updateById(userId, updates);

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'Usuario no encontrado');
  }

  return user;
}

async function changePassword(userId, { currentPassword, newPassword, newPasswordConfirmation }) {
  if (newPassword !== newPasswordConfirmation) {
    throw new AppError('PASSWORDS_DO_NOT_MATCH', 'Las contraseñas no coinciden');
  }

  const user = await userRepository.findById(userId, { withPassword: true });

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'Usuario no encontrado');
  }

  const currentPasswordValid = await verifyPassword(user.passwordHash, currentPassword);
  if (!currentPasswordValid) {
    throw new AppError('CURRENT_PASSWORD_INCORRECT', 'La contraseña actual es incorrecta');
  }

  const sameAsCurrentPassword = await verifyPassword(user.passwordHash, newPassword);
  if (sameAsCurrentPassword) {
    throw new AppError('VALIDATION_ERROR', 'La nueva contraseña no puede ser igual a la actual', [
      { field: 'newPassword', message: 'La nueva contraseña no puede ser igual a la actual' },
    ]);
  }

  const passwordHash = await hashPassword(newPassword);

  await userRepository.updateById(user._id, { passwordHash, passwordChangedAt: new Date() });
  await sessionService.revokeAllForUser(user._id);

  await auditService.record({
    actorId: user._id,
    action: AUDIT_ACTIONS.PASSWORD_CHANGED,
    targetType: 'User',
    targetId: user._id,
  });
}

async function listCustomers(query) {
  const { items, total } = await userRepository.listCustomers(query);
  const { page, limit } = query;

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
}

async function getCustomerDetail(id) {
  const user = await userRepository.findCustomerById(id);

  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'Usuario no encontrado');
  }

  return user;
}

async function updateCustomerStatus(actingAdmin, targetId, { status, reason }) {
  if (String(actingAdmin._id) === String(targetId)) {
    throw new AppError('CANNOT_BLOCK_SELF', 'No puedes cambiar tu propio estado desde esta ruta');
  }

  const user = await userRepository.findCustomerById(targetId);
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'Usuario no encontrado');
  }

  const updatedUser = await userRepository.updateById(targetId, { status });

  if (status === USER_STATUS.BLOCKED) {
    await sessionService.revokeAllForUser(targetId);
    await auditService.record({
      actorId: actingAdmin._id,
      action: AUDIT_ACTIONS.CUSTOMER_BLOCKED,
      targetType: 'User',
      targetId,
      metadata: { reason },
    });
  } else if (status === USER_STATUS.ACTIVE) {
    await auditService.record({
      actorId: actingAdmin._id,
      action: AUDIT_ACTIONS.CUSTOMER_UNBLOCKED,
      targetType: 'User',
      targetId,
      metadata: { reason },
    });
  }

  return updatedUser;
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  listCustomers,
  getCustomerDetail,
  updateCustomerStatus,
};
