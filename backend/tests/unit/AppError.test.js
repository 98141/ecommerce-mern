const { AppError } = require('../../src/shared/errors/AppError');

describe('AppError', () => {
  it('maps a known error code to its catalog status', () => {
    const error = new AppError('EMAIL_ALREADY_REGISTERED');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('EMAIL_ALREADY_REGISTERED');
    expect(error.isOperational).toBe(true);
  });

  it('throws when the error code is not in the catalog', () => {
    expect(() => new AppError('NOT_A_REAL_CODE')).toThrow();
  });

  it('carries optional details', () => {
    const details = [{ field: 'email', message: 'inválido' }];
    const error = new AppError('VALIDATION_ERROR', 'Datos inválidos', details);
    expect(error.details).toEqual(details);
  });
});
