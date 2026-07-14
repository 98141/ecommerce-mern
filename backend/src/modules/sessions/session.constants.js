const ms = require('../../shared/utils/duration.util');
const { env } = require('../../config/env');

const REFRESH_TOKEN_TTL_MS = ms(env.JWT_REFRESH_EXPIRES_IN);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  domain: env.COOKIE_DOMAIN || undefined,
  path: '/api/v1/auth',
};

module.exports = { REFRESH_TOKEN_TTL_MS, COOKIE_OPTIONS };
