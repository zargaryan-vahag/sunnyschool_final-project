const AppError = require('../managers/app-error');
const TokenManager = require('../managers/token-manager');

module.exports = async (req, res, next) => {
  const token = req.headers.accesstoken || req.query.accessToken || req.body.accessToken;
  if (token) {
    try {
      const userData = await TokenManager.decode(token);
      if (userData.userId) {
        req.userData = userData;
        next();
      } else {
        return res.onError(new AppError('Auth error', 401));
      }
    } catch (e) {
      return res.onError(new AppError('Token not provided', 401));
    }
  } else {
    return res.onError(new AppError('Token not provided', 401));
  }
};
