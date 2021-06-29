const UserService = require('../services/user-service');

class AuthController {
  static async signup(req, res, next) {
    try {
      await UserService.signup(req.body.email,
        req.body.username,
        req.body.firstname,
        req.body.lastname,
        req.body.password,
      );
      
      res.onSuccess({}, "User created");
    } catch (e) {
      next(e);
    }
  }

  static async verify(req, res, next) {
    try {
      await UserService.verify(req.body.verifyToken);
      res.onSuccess({}, "User successfully verified");
    } catch (e) {
      next(e);
    }
  }

  static async signin(req, res, next) {
    try {
      const accessToken = await UserService.signin(req.body.login, req.body.password);      
      res.onSuccess(accessToken, "Succesfully logged in");
    } catch (e) {
      next(e);
    }
  }

  static async getData(req, res, next) {
    try {
      const user = await UserService.getById(req.userData.userId);
      res.onSuccess(user);
    } catch (e) {
      next(e);
    }
  }

  static async forgot(req, res, next) {
    try {
      await UserService.forgot(req.body.email);
      res.onSuccess(null, "Email with instructions has been sent");
    } catch (e) {
      next(e);
    }
  }

  static async passreset(req, res, next) {
    try {
      await UserService.resetPassword(req.body.password, req.body.resetToken);
      res.onSuccess(null, "Password was successfuly reseted");
    } catch (e) {
      next(e);
    }
  }
}

module.exports = AuthController;
