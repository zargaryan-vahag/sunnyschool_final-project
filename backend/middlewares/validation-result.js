const { validationResult } = require('express-validator');
const AppError = require('../managers/app-error');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.onError(new AppError('Validation Error', 403), errors.mapped());
  }
  next();
};
