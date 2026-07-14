const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: { status: 400 },
  PASSWORDS_DO_NOT_MATCH: { status: 400 },
  INVALID_VERIFICATION_TOKEN: { status: 400 },
  EXPIRED_VERIFICATION_TOKEN: { status: 400 },
  INVALID_RESET_TOKEN: { status: 400 },
  EXPIRED_RESET_TOKEN: { status: 400 },
  TOKEN_ALREADY_USED: { status: 400 },
  REFRESH_TOKEN_MISSING: { status: 400 },
  INVALID_REFRESH_TOKEN: { status: 400 },
  EXPIRED_REFRESH_TOKEN: { status: 400 },
  INVALID_USER_STATUS: { status: 400 },

  INVALID_CREDENTIALS: { status: 401 },
  AUTHENTICATION_REQUIRED: { status: 401 },
  INVALID_ACCESS_TOKEN: { status: 401 },
  EXPIRED_ACCESS_TOKEN: { status: 401 },
  CURRENT_PASSWORD_INCORRECT: { status: 401 },

  FORBIDDEN: { status: 403 },
  ACCOUNT_BLOCKED: { status: 403 },
  EMAIL_NOT_VERIFIED: { status: 403 },
  ACCOUNT_TEMPORARILY_LOCKED: { status: 403 },
  REVOKED_SESSION: { status: 403 },
  SESSION_REUSE_DETECTED: { status: 403 },
  CANNOT_BLOCK_SELF: { status: 403 },

  USER_NOT_FOUND: { status: 404 },
  ROUTE_NOT_FOUND: { status: 404 },

  EMAIL_ALREADY_REGISTERED: { status: 409 },

  TOO_MANY_REQUESTS: { status: 429 },

  INTERNAL_SERVER_ERROR: { status: 500 },
});

module.exports = { ERROR_CODES };
