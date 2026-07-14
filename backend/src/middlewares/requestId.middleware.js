const { randomUUID } = require('crypto');

function requestId(req, res, next) {
  const incomingId = req.headers['x-request-id'];
  req.id = typeof incomingId === 'string' && incomingId.length > 0 ? incomingId : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

module.exports = { requestId };
