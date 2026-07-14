const { AppError } = require('../shared/errors/AppError');

function requireVerifiedEmail(req, res, next) {
  if (!req.user) {
    return next(new AppError('AUTHENTICATION_REQUIRED', 'Se requiere autenticación'));
  }

  if (!req.user.emailVerified) {
    return next(new AppError('EMAIL_NOT_VERIFIED', 'Debes verificar tu correo electrónico'));
  }

  next();
}

module.exports = { requireVerifiedEmail };
