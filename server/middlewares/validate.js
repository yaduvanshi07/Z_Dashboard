const AppError = require("../utils/AppError");

function validateBody(schemaFn) {
  return (req, res, next) => {
    const { error, value } = schemaFn(req.body);
    if (error) {
      const message = error.details.map((d) => d.message).join("; ");
      return next(new AppError(message, 400));
    }
    req.body = value;
    return next();
  };
}

function validateQuery(schemaFn) {
  return (req, res, next) => {
    const { error, value } = schemaFn(req.query);
    if (error) {
      const message = error.details.map((d) => d.message).join("; ");
      return next(new AppError(message, 400));
    }
    req.validatedQuery = value;
    return next();
  };
}

module.exports = { validateBody, validateQuery };
