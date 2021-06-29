const express = require('express');
const { body, param, query } = require('express-validator');

const router = express.Router();
const isLoggedIn = require('../middlewares/token-validator');
const validationResult = require('../middlewares/validation-result');
const upload = require('../middlewares/upload');
const UserController = require('../controllers/user-controller');

router.get('/',
  isLoggedIn(),
  query('q').exists(),
  validationResult,
  UserController.getUsers
);
router.patch('/',
  isLoggedIn(),
  body('firstname', 'Invalid firstname')
    .exists()
    .isLength({ min: 2, max: 32 }).bail()
    .isAlpha(),
  body('lastname', 'Invalid lastname')
    .exists()
    .isLength({ min: 2, max: 32 }).bail()
    .isAlpha(),
  body('hometown')
    .exists()
    .isLength({ max: 32 }).bail(),
  body('gender')
    .exists()
    .isFloat({ min: 0, max: 2 }),
  validationResult,
  UserController.updateUser
);

router.get('/id/:id',
  isLoggedIn(),
  param('id').exists().isMongoId(),
  validationResult,
  UserController.getUserById
);
router.get('/username/:username',
  isLoggedIn(),
  param('username').exists(),
  validationResult,
  UserController.getUserByUsername
);

router.patch('/avatar',
  upload.single('file'),
  isLoggedIn({ ignoreError: true }),
  UserController.updateAvatar
);
router.delete('/avatar',
  isLoggedIn(),
  UserController.deleteAvatar
);

router.get('/friendrequest',
  isLoggedIn(),
  UserController.getFriendRequest
);
router.post('/friendrequest',
  isLoggedIn(),
  body('to').exists().isMongoId(),
  validationResult,
  UserController.sendFriendRequest
);

router.get('/friendrequest/:userId',
  isLoggedIn(),
  param('userId').exists().isMongoId(),
  validationResult,
  UserController.checkFriendRequest
);

router.get('/friendrequestcount',
  isLoggedIn(),
  UserController.getFriendRequestsCount
);

router.get('/isfriend/:userId',
  isLoggedIn(),
  param('userId').exists().isMongoId(),
  validationResult,
  UserController.checkFriend
);

router.delete('/unfriend/:userId',
  isLoggedIn(),
  param('userId').exists().isMongoId(),
  validationResult,
  UserController.unfriend
);

router.delete('/refusefriend/:userId',
  isLoggedIn(),
  param('userId').exists().isMongoId(),
  validationResult,
  UserController.refuseFriendRequest
);

router.get('/friends/:userId',
  isLoggedIn(),
  param('userId').exists().isMongoId(),
  query('page').exists(),
  validationResult,
  UserController.getFriends
);

router.get('/friendscount/:userId',
  isLoggedIn(),
  param('userId').exists().isMongoId(),
  validationResult,
  UserController.getFriendsCount
);

module.exports = router;
