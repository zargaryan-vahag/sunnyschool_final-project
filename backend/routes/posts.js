const express = require('express');
const { body, query } = require('express-validator');
const fs = require('fs');

const router = express.Router();
const isLoggedIn = require('../middlewares/token-validator');
const validationResult = require('../middlewares/validation-result');
const upload = require('../middlewares/upload');
const UsersCtrl = require('../controllers/users.ctrl');
const PostsCtrl = require('../controllers/posts.ctrl');
const AppError = require('../managers/app-error');
const CommentsCtrl = require('../controllers/comments.ctrl');

router.route('/')
  .get(
    isLoggedIn,
    query('page').isNumeric(),
    async (req, res) => {
      try {
        const posts = await PostsCtrl.findNews({}, req.userData.userId, req.query.page);
        if (posts) {
          res.onSuccess(posts, "");
        } else {
          throw new Error("No found posts");
        }
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  )
  .post(
    upload.array('files', 10),
    async (req, res) => {      
      try {
        const loggedIn = await isLoggedIn(req, {onError() {
          return false;
        }}, () => {});

        if (loggedIn !== false) {
          if (req.files && req.files.length === 0 && (!req.body.postText || req.body.postText == '')) {
            throw new Error("Wrong data");
          }
          
          const files = req.files.map((file) => {
            return file.filename;
          });

          await PostsCtrl.add({
            author: req.userData.userId,
            content: req.body.postText,
            files: files,
          });

          res.onSuccess({}, "Post created");
        } else {
          throw new Error("Token not provided");
        }
      } catch (e) {
        if (req.files) {
          const files = [];
          req.files.forEach((file) => {
            files.push(fs.promises.unlink(__homedir + '/public/uploads/' + file.filename))
          });
          await Promise.all(files);
        }
        res.onError(new AppError(e.message), 400);
      }
    }
  )
  .delete(
    isLoggedIn,
    body('postId').exists(),
    async (req, res) => {
      try {
        const post = await PostsCtrl.getById(req.body.postId);
        if (post) {
          if (post.author == req.userData.userId) {
            await PostsCtrl.delete(req.body.postId);
            res.onSuccess({}, "Post deleted");
          } else {
            throw new Error("Assess denied");
          }
        } else {
          throw new Error("Post not found");
        }
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  );

router.route('/user/:userId')
  .get(
    isLoggedIn,
    query('action').exists(),
    query('page').isNumeric(),
    async (req, res) => {
      try {
        if (req.query.action == 'posts') {
          const userPosts = await PostsCtrl.find(
            { author: req.params.userId },
            req.userData.userId,
            req.query.page
          );
          res.onSuccess(userPosts, "");
        } else if (req.query.action == 'postsCount') {
          const count = await PostsCtrl.count({ author: req.params.userId });
          res.onSuccess(count, "");
        } else {
          throw new Error("Unknown action");
        }
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  );

router.route('/like/:postId')
  .post(
    isLoggedIn,
    async (req, res) => {
      try {
        const result = await PostsCtrl.toggleLike(req.params.postId, req.userData.userId);
        res.onSuccess(result, "");
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  );


router.route('/comments/:postId')
  .get(
    isLoggedIn,
    query('page')
      .isNumeric()
      .exists(),
    validationResult,
    async (req, res) => {
      try {
        const comments = await PostsCtrl.getComments(req.params.postId, req.query.page);
        res.onSuccess(comments, "");
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  )
  .post(
    isLoggedIn,
    body('text')
      .exists().bail()
      .isString().bail()
      .isLength({ min: 1 }).bail(),
    validationResult,
    async (req, res) => {
      try {
        const post = await PostsCtrl.getById(req.params.postId);

        if (post) {
          const comment = await PostsCtrl.addComment(
            req.params.postId,
            req.userData.userId,
            req.body.text
          );
          
          res.onSuccess({
            commentsCount: post.comments + 1,
            comment: comment,
          }, "Comment created");
        } else {
          throw new Error("Post not found");
        }
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  )
  .delete(
    isLoggedIn,
    body('commentId').exists(),
    validationResult,
    async (req, res) => {
      try {
        const comment = await CommentsCtrl.getById(req.body.commentId);
        const post = await PostsCtrl.getById(req.params.postId);

        if (!comment) {
          throw new Error("Comment not found");
        }

        if (!post) {
          throw new Error("Post not found");
        }

        if (
          comment.userId == req.userData.userId ||
          post.author == req.userData.userId
        ) {
          await PostsCtrl.delComment(req.params.postId, req.body.commentId);
          res.onSuccess({ commentsCount: post.comments - 1 }, "Comment deleted");
        } else {
          throw new Error("Access denied");
        }
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  );

router.route('/liked')
  .get(
    isLoggedIn,
    query('page').isNumeric(),
    async (req, res) => {
      try {
        const result = await PostsCtrl.findLiked(req.userData.userId, req.query.page);
        res.onSuccess(result, "");
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  );

module.exports = router;
