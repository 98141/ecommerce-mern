const { logger } = require('../config/logger');
const { isProduction } = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isOperational = err.isOperational === true;
  const statusCode = isOperational ? err.statusCode : 500;
  const code = isOperational ? err.code : 'INTERNAL_SERVER_ERROR';
  const message = isOperational ? err.message : 'Ha ocurrido un error inesperado';

  if (!isOperational) {
    logger.error({ err, requestId: req.id }, 'Error no controlado');
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {}),
      ...(!isProduction && !isOperational ? { stack: err.stack } : {}),
    },
  });
}

module.exports = { errorHandler };
