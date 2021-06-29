const express = require('express');
const { body, query, param } = require('express-validator');

const router = express.Router();
const isLoggedIn = require('../middlewares/token-validator');
const validationResult = require('../middlewares/validation-result');
const upload = require('../middlewares/upload');
const PostController = require('../controllers/post-controller');

router.get('/',
  isLoggedIn(),
  query('page').isNumeric(),
  validationResult,
  PostController.getPosts
);
router.post('/',
  upload.array('files', 10),
  isLoggedIn({ ignoreError: true }),
  PostController.createPost
);
router.delete('/',
  isLoggedIn(),
  body('postId').exists().isMongoId(),
  validationResult,
  PostController.deletePost
);

router.get('/user/:userId',
  isLoggedIn(),
  param('userId').exists().isMongoId(),
  query('action').exists(),
  validationResult,
  PostController.getUserPosts
);

router.post('/like/:postId',
  isLoggedIn(),
  param('postId').exists().isMongoId(),
  validationResult,
  PostController.like
);


router.get('/comments/:postId',
  isLoggedIn(),
  param('postId').exists().isMongoId(),
  query('page').exists().isNumeric(),
  validationResult,
  PostController.getPostComments
);
router.post('/comments/:postId',
  isLoggedIn(),
  param('postId').exists().isMongoId(),
  body('text')
    .exists().bail()
    .isString().bail()
    .isLength({ min: 1 }).bail(),
  validationResult,
  PostController.createPostComment
);
router.delete('/comments/:postId',
  isLoggedIn(),
  param('postId').exists().isMongoId(),
  body('commentId').exists().isMongoId(),
  validationResult,
  PostController.deletePostComment
);

router.get('/liked',
  isLoggedIn(),
  query('page').isNumeric(),
  validationResult,
  PostController.getLikedPosts
);

module.exports = router;
