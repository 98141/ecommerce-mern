const userTokenRepository = require('./userToken.repository');
const { generateRawToken, hashToken } = require('../../shared/utils/token.util');
const { EXPIRES_MINUTES_BY_TYPE } = require('./userToken.constants');
const { AppError } = require('../../shared/errors/AppError');

async function issueToken(userId, type) {
  await userTokenRepository.invalidateActiveByUserAndType(userId, type);

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + EXPIRES_MINUTES_BY_TYPE[type] * 60 * 1000);

  await userTokenRepository.create({ userId, type, tokenHash, expiresAt });

  return rawToken;
}

async function consumeToken(rawToken, type, { invalidTokenCode, expiredTokenCode }) {
  const tokenHash = hashToken(rawToken);
  const token = await userTokenRepository.findActiveByHash(tokenHash);

  if (!token || token.type !== type) {
    throw new AppError(invalidTokenCode, 'Token inválido');
  }

  if (token.usedAt) {
    throw new AppError('TOKEN_ALREADY_USED', 'El token ya fue utilizado');
  }

  if (token.expiresAt.getTime() < Date.now()) {
    throw new AppError(expiredTokenCode, 'El token expiró');
  }

  await userTokenRepository.markUsed(token._id);

  return token;
}

module.exports = { issueToken, consumeToken };
