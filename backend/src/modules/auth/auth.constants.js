const { env } = require('../../config/env');

const MAX_FAILED_ATTEMPTS = env.AUTH_MAX_FAILED_ATTEMPTS;
const LOCK_MINUTES = env.AUTH_LOCK_MINUTES;
const COOKIE_NAME = env.COOKIE_NAME;

module.exports = { MAX_FAILED_ATTEMPTS, LOCK_MINUTES, COOKIE_NAME };
