const pino = require('pino');
const { env } = require('./env');

const logger = pino({
  level: env.LOG_LEVEL,
});

module.exports = { logger };
