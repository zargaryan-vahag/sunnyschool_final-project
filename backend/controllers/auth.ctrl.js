const User = require('../models/user');
const UsersCtrl = require('../controllers/users.ctrl');
const bcrypt = require('../managers/bcrypt');
const TokenManager = require('../managers/token-manager');
const Mail = require('../managers/mail-manager');
const AppError = require('../managers/app-error');

class AuthCtrl {
  static findOne(params) {
    return User.findOne(params).select("+password +token +email");
  }

  static async add(data) {
    if (await UsersCtrl.exists({ email: data.email })) {
      throw AppError.badRequest('Email is already taken');
    } else if (await UsersCtrl.exists({ username: data.username })) {
      throw AppError.badRequest('Username is already taken');
    } else {
      return UsersCtrl.add({
        email: data.email,
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        password: await bcrypt.hash(data.password),
        token: data.token
      });
    }
  }

  static async verify(token) {
    const user = await User.findOne({ token: token }).select("+password +token +email");
    if (!user) {
      throw AppError.notFound('User not found');
    } else {
      user.isverified = true;
      user.token = "";
      return user.save();
    }
  }

  static async signin(login, password) {
    let user;
    if (login.includes("@")) {
      user = await User.findOne({ email: login }).select("+password +token +email");
    } else {
      user = await User.findOne({ username: login }).select("+password +token +email");
    }
    
    if (user && user.isverified) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return TokenManager.encode({
          userId: user._id
        });
      } else {
        throw AppError.badRequest("Wrong login or password");
      }
    } else {
      throw AppError.badRequest("Wrong login or password");
    }
  }

  static async sendChangePassMail(email, token) {
    const mail = new Mail(email, {
      subject: 'Password reset',
      html: `Click <a href="http://${process.env.frontendHost}:${process.env.frontendPort}/passwordreset/${token}">HERE</a> to change your password`,
    });
    await mail.send();
  }

  static async hashPassword(pass) {
    return await bcrypt.hash(pass);
  }
}

module.exports = AuthCtrl;
