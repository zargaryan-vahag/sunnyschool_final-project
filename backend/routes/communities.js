const express = require('express');
const { body, query, param } = require('express-validator');

const router = express.Router();
const CommunityController = require('../controllers/community-controller');
const validationResult = require('../middlewares/validation-result');
const upload = require('../middlewares/upload');
const isLoggedIn = require('../middlewares/token-validator');

router.get('/',
  isLoggedIn(),
  query('q').exists(),
  validationResult,
  CommunityController.getCommunities
);

router.post('/',
  isLoggedIn(),
  body('name').exists().isLength({ min: 1, max: 128 }),
  validationResult,
  CommunityController.createCommunity
);

router.get('/:commId',
  isLoggedIn(),
  param('commId').exists().isMongoId(),
  CommunityController.getCommunity
);

router.get('/userfollowing/:userId',
  isLoggedIn(),
  param('userId').exists().isMongoId(),
  query('page').exists().isNumeric(),
  validationResult,
  CommunityController.getUserFollowingCommunities
);

router.get('/usercreated/:userId',
  isLoggedIn(),
  param('userId').exists().isMongoId(),
  query('page').exists().isNumeric(),
  validationResult,
  CommunityController.getUserCommunities
);

router.get('/posts/:commId',
  isLoggedIn(),
  param('commId').exists().isMongoId(),
  query('page').exists().isNumeric(),
  validationResult,
  CommunityController.getCommunityPosts
);

router.get('/isfollower/:communityId',
  isLoggedIn(),
  param('communityId').exists().isMongoId(),
  validationResult,
  CommunityController.isFollower
);

router.post('/togglefollow/:commId',
  param('commId').exists().isMongoId(),
  isLoggedIn(),
  CommunityController.follow
);

router.patch('/avatar',
  upload.single('file'),
  isLoggedIn({ ignoreError: true }),
  body('communityId').exists().isMongoId(),
  CommunityController.updateAvatar
);

router.delete('/avatar',
  isLoggedIn(),
  body('communityId').exists().isMongoId(),
  validationResult,
  CommunityController.deleteAvatar
);

module.exports = router;
