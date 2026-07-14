const { ERROR_CODES } = require('./errorCodes');

class AppError extends Error {
  constructor(code, message, details) {
    const catalogEntry = ERROR_CODES[code];

    if (!catalogEntry) {
      throw new Error(`Código de error desconocido: ${code}`);
    }

    super(message || code);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = catalogEntry.status;
    this.details = details;
    this.isOperational = true;
  }
}

module.exports = { AppError };
