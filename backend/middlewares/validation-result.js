const { validationResult } = require('express-validator');
const AppError = require('../managers/app-error');
const errorMiddleware = require('../middlewares/error');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = AppError.badRequest('Validation Error', errors.mapped());
    return errorMiddleware(err, req, res);
  }
  next();
};
