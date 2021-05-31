const express = require('express');
const { body } = require('express-validator');
const randomstring = require("randomstring");

const router = express.Router();
const AuthCtrl = require('../controllers/auth.ctrl');
const UsersCtrl = require('../controllers/users.ctrl.js');
const AppError = require('../managers/app-error');
const Mail = require('../managers/mail-manager');
const validationResult = require('../middlewares/validation-result');
const isLoggedIn = require('../middlewares/token-validator');

router
  .post('/signup',
    body('email', 'Invalid email')
      .isEmail(),
    body('username', 'Invalid username')
      .trim().bail()
      .isLength({ min: 3, max: 32 }).bail()
      .custom((value, { req, res }) => {
        return (/^[a-zA-Z0-9_\-.]+$/gm.test(value)) ? true : false;
      }),
    body('firstname', 'Invalid firstname')
      .isLength({ min: 2, max: 32 }).bail()
      .isAlpha(),
    body('lastname', 'Invalid lastname')
      .isLength({ min: 2, max: 32 }).bail()
      .isAlpha(),
    body('password', 'Invalid password')
      .isLength({ min: 8, max: 32 }).bail()
      .exists(),
    validationResult,
    async (req, res) => {
      try {
        const token = randomstring.generate(32);
        const userdata = await AuthCtrl.add({
          email: req.body.email,
          username: req.body.username,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          password: req.body.password,
          token: token
        });

        const mail = new Mail(userdata.email, {
          subject: 'Account confirmation',
          html: `Click <a href="http://${process.env.frontendHost}:${process.env.frontendPort}/verify?token=${token}">HERE</a> to verify your account`,
        });
        
        res.onSuccess({}, "User created");

        await mail.send();
      } catch (e) {
        res.onError(new AppError(e, 400));
      }
    })
  .post('/verify',
    body('verifyToken').exists(),
    validationResult,
    async (req, res) => {
      const token = req.body.verifyToken;
      try {
        await AuthCtrl.verify(token);
        res.onSuccess(null, "User successfully verified", 200);
      } catch (e) {
        res.onError(new AppError(e, 404));
      }
    })
  .post('/signin',
    body('login').exists(),
    body('password').exists(),
    validationResult,
    async (req, res) => {
      try {
        const accessToken = await AuthCtrl.signin(req.body.login, req.body.password);
        if (accessToken) {
          res.onSuccess(accessToken, "Succesfully logged in");
        }
      } catch (e) {
        res.onError(new AppError(e, 400));
      }
    })
  .post('/user',
    isLoggedIn,
    async (req, res) => {
      try {
        const user = await UsersCtrl.getById(req.userData.userId);
        res.onSuccess(user.toObject(), "");
      } catch (e) {
        res.onError(new AppError(e, 401));
      }
    })
  .post('/forgot',
    body('email').exists().isEmail(),
    validationResult,
    async (req, res) => {
      try {
        const user = await AuthCtrl.findOne({ email: req.body.email });
        const token = randomstring.generate(32);
        
        if (!user) {
          throw new Error("User not found");
        }

        if (!user.isverified) {
          throw new Error("User is not verified");
        }

        user.token = token;
        user.save();
        await AuthCtrl.sendChangePassMail(user.email, token);
        res.onSuccess(null, "Email with instructions has been sent");
      } catch (e) {
        console.log(e);
        res.onError(new AppError(e, 400));
      }
    })
  .post('/passreset',
    body('password').exists().isLength({ min: 8, max: 32 }).bail(),
    body('resetToken').exists(),
    validationResult,
    async (req, res) => {
      try {
        const user = await UsersCtrl.findOne({ token: req.body.resetToken });
        if (!user) {
          throw new Error("User not found");
        }

        user.password = await AuthCtrl.hashPassword(req.body.password);
        user.token = "";
        user.save();

        res.onSuccess(null, "Password was successfuly reseted");
      } catch (e) {
        res.onError(new AppError(e, 404));
      }
    });

module.exports = router;
