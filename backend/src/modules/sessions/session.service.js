const crypto = require('crypto');
const sessionRepository = require('./session.repository');
const { REFRESH_TOKEN_TTL_MS } = require('./session.constants');
const { generateRawToken, hashToken } = require('../../shared/utils/token.util');
const { AppError } = require('../../shared/errors/AppError');
const auditService = require('../audit/audit.service');
const { AUDIT_ACTIONS } = require('../../shared/constants/auditActions');

async function createSession(userId, { userAgent = '', ipAddress = '', familyId } = {}) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  const session = await sessionRepository.create({
    userId,
    tokenHash,
    familyId: familyId || crypto.randomUUID(),
    userAgent,
    ipAddress,
    expiresAt,
  });

  return { rawToken, session };
}

async function rotateSession(rawToken, { userAgent = '', ipAddress = '' } = {}) {
  if (!rawToken) {
    throw new AppError('REFRESH_TOKEN_MISSING', 'No se recibió el refresh token');
  }

  const tokenHash = hashToken(rawToken);
  const currentSession = await sessionRepository.findByTokenHash(tokenHash);

  if (!currentSession) {
    throw new AppError('INVALID_REFRESH_TOKEN', 'Refresh token inválido');
  }

  if (currentSession.revokedAt) {
    await sessionRepository.revokeFamily(currentSession.familyId);
    await auditService.record({
      actorId: currentSession.userId,
      action: AUDIT_ACTIONS.REFRESH_TOKEN_REUSE_DETECTED,
      targetType: 'User',
      targetId: currentSession.userId,
      ipAddress,
      userAgent,
    });
    throw new AppError('SESSION_REUSE_DETECTED', 'Reutilización de sesión detectada');
  }

  if (currentSession.expiresAt.getTime() < Date.now()) {
    throw new AppError('EXPIRED_REFRESH_TOKEN', 'El refresh token expiró');
  }

  const { rawToken: newRawToken, session: newSession } = await createSession(currentSession.userId, {
    userAgent,
    ipAddress,
    familyId: currentSession.familyId,
  });

  await sessionRepository.revokeById(currentSession._id, { replacedByTokenHash: newSession.tokenHash });
  await sessionRepository.touchLastUsed(currentSession._id);

  return { rawToken: newRawToken, session: newSession, userId: currentSession.userId };
}

async function revokeByRawToken(rawToken) {
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const session = await sessionRepository.findByTokenHash(tokenHash);

  if (session && !session.revokedAt) {
    await sessionRepository.revokeById(session._id);
  }

  return session;
}

async function revokeAllForUser(userId) {
  await sessionRepository.revokeAllForUser(userId);
}

module.exports = { createSession, rotateSession, revokeByRawToken, revokeAllForUser };
