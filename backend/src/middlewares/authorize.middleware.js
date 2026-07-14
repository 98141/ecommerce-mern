const { AppError } = require('../shared/errors/AppError');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('AUTHENTICATION_REQUIRED', 'Se requiere autenticación'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('FORBIDDEN', 'No tienes permisos para acceder a este recurso'));
    }

    next();
  };
}

module.exports = { authorize };
