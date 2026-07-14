const rateLimit = require('express-rate-limit');

function createRateLimiter({ windowMs, max, message = 'TOO_MANY_REQUESTS' }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: { code: message, message: 'Demasiados intentos, inténtalo más tarde' },
      });
    },
  });
}

const loginRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });
const sensitiveActionRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });

module.exports = { createRateLimiter, loginRateLimiter, sensitiveActionRateLimiter };
