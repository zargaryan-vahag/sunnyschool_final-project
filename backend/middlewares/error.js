const AppError = require('../managers/app-error');

module.exports = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.httpStatus).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }
  return res.status(500).json({ success: false, message: 'Unknown error \n' + err.message });
};
