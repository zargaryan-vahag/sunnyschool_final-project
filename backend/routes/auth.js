const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const validationResult = require('../middlewares/validation-result');
const isLoggedIn = require('../middlewares/token-validator');
const AuthController = require('../controllers/auth-controller');

router.post('/signup',
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
  AuthController.signup
);

router.post('/verify',
  body('verifyToken').exists(),
  validationResult,
  AuthController.verify
);

router.post('/signin',
  body('login').exists(),
  body('password').exists(),
  validationResult,
  AuthController.signin
);

router.post('/user',
  isLoggedIn(),
  AuthController.getData
);

router.post('/forgot',
  body('email').exists().isEmail(),
  validationResult,
  AuthController.forgot
);

router.post('/passreset',
  body('password').exists().isLength({ min: 8, max: 32 }).bail(),
  body('resetToken').exists(),
  validationResult,
  AuthController.passreset
);

module.exports = router;
