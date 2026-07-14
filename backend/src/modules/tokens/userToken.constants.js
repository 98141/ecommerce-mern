const { env } = require('../../config/env');
const { TOKEN_TYPES } = require('../../shared/constants/tokenTypes');

const EXPIRES_MINUTES_BY_TYPE = {
  [TOKEN_TYPES.EMAIL_VERIFICATION]: env.EMAIL_VERIFICATION_EXPIRES_MINUTES,
  [TOKEN_TYPES.PASSWORD_RESET]: env.PASSWORD_RESET_EXPIRES_MINUTES,
};

module.exports = { EXPIRES_MINUTES_BY_TYPE };
