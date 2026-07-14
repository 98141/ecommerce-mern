const { AppError } = require('../shared/errors/AppError');

function formatZodIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      throw new AppError('VALIDATION_ERROR', 'Los datos enviados no son válidos', formatZodIssues(result.error));
    }

    if (result.data.body !== undefined) req.body = result.data.body;
    if (result.data.params !== undefined) req.params = result.data.params;

    // req.query is a getter that re-parses the URL on every access in
    // Express 5, so the validated value must be reattached as an own,
    // writable property instead of mutated or reassigned through the getter.
    if (result.data.query !== undefined) {
      Object.defineProperty(req, 'query', {
        value: result.data.query,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    next();
  };
}

module.exports = { validate };
