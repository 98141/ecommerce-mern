const jwt = require('jsonwebtoken');
const { verifyAccessToken } = require('../modules/auth/auth.tokens');
const userRepository = require('../modules/users/user.repository');
const { AppError } = require('../shared/errors/AppError');
const { USER_STATUS } = require('../shared/constants/userStatus');

function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

async function authenticate(req, res, next) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw new AppError('AUTHENTICATION_REQUIRED', 'Se requiere autenticación');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('EXPIRED_ACCESS_TOKEN', 'El access token expiró');
      }
      throw new AppError('INVALID_ACCESS_TOKEN', 'Access token inválido');
    }

    const user = await userRepository.findById(payload.sub);

    if (!user) {
      throw new AppError('INVALID_ACCESS_TOKEN', 'Access token inválido');
    }

    if (user.status === USER_STATUS.BLOCKED) {
      throw new AppError('ACCOUNT_BLOCKED', 'La cuenta está bloqueada');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticate };
