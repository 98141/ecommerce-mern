const { sanitize } = require('express-mongo-sanitize');

// Express 5's req.query is a getter that re-parses the URL on every access
// (no caching), so it must be captured once and re-attached as an own,
// writable property rather than reassigned or mutated through the getter.
function mongoSanitize(req, res, next) {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);

  const query = req.query;
  if (query) {
    sanitize(query);
    Object.defineProperty(req, 'query', { value: query, writable: true, enumerable: true, configurable: true });
  }

  next();
}

module.exports = { mongoSanitize };
