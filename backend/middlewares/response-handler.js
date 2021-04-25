const ResponseManager = require('../managers/response-manager.js');

module.exports = (req, res, next) => {
  const responseHandler = ResponseManager.getResponseHandler(res);
  res.onSuccess = responseHandler.onSuccess;
  res.onError = responseHandler.onError;
  next();
}