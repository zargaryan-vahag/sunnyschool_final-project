const AppError = require('../managers/app-error');
const errorMiddleware = require('../middlewares/error');
const TokenManager = require('../managers/token-manager');

module.exports = (options = { ignoreError: false }) => {
  return async (req, res, next) => {
    const token = req.headers.accesstoken || req.query.accessToken || req.body.accessToken;

    try {
      if (!token) {
        throw AppError.unauthorized();
      }
      const userData = await TokenManager.decode(token);
      if (!userData.userId) {
        throw AppError.unauthorized();
      }
      
      req.userData = userData;
      next();
    } catch (e) {
      if (!options.ignoreError) {
        errorMiddleware(e, req, res);
      }
    }
  };
};
