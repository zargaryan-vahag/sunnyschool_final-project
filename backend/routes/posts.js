const express = require('express');
const { body, query, param } = require('express-validator');
const fs = require('fs');

const router = express.Router();
const isLoggedIn = require('../middlewares/token-validator');
const validationResult = require('../middlewares/validation-result');
const upload = require('../middlewares/upload');
const PostsCtrl = require('../controllers/posts.ctrl');
const AppError = require('../managers/app-error');
const CommentsCtrl = require('../controllers/comments.ctrl');
const CommunitiesCtrl = require('../controllers/communities.ctrl');

router.route('/')
  .get(
    isLoggedIn(),
    query('page').isNumeric(),
    validationResult,
    async (req, res, next) => {
      try {
        const posts = await PostsCtrl.findNews({}, req.userData.userId, req.query.page);
        if (!posts) {
          throw AppError.notFound("No found posts");
        }

        res.onSuccess(posts, "");
      } catch (e) {
        next(e);
      }
    })
  .post(
    upload.array('files', 10),
    isLoggedIn({ ignoreError: true }),
    async (req, res, next) => {      
      try {
        if (!req.userData) {
          throw AppError.unauthorized();
        }
        if (
          req.files && req.files.length === 0 && 
          req.body.postText && req.body.postText == ''
        ) {
          throw AppError.badRequest("Post must contain file, text or both");
        }
        
        const files = req.files ? req.files.map(file => file.filename) : [];
        const params = {
          author: req.userData.userId,
          content: req.body.postText.trim(),
          files: files
        };

        if (req.body.communityId) {
          const comm = await CommunitiesCtrl.getById(req.body.communityId);
          if (!comm) {
            throw AppError.notFound('Community not found');
          }
          if (comm.creatorId != req.userData.userId) {
            throw AppError.inaccessible('Acces to community denied');
          }
          params.community = comm._id;
        }

        const newPost = await PostsCtrl.add(params);
        if (params.community) {
          await CommunitiesCtrl.addPost(params.community, newPost._id);
        }
        res.onSuccess(await PostsCtrl.getCommunityPost(newPost._id), "Post created");
      } catch (e) {
        if (req.files) {
          const files = [];
          req.files.forEach((file) => {
            files.push(fs.promises.unlink(__homedir + '/public/uploads/' + file.filename))
          });
          await Promise.all(files);
        }
        next(e);
      }
    })
  .delete(
    isLoggedIn(),
    body('postId').exists(),
    validationResult,
    async (req, res, next) => {
      try {
        const post = await PostsCtrl.getById(req.body.postId);
        if (!post) {
          throw AppError.notFound("Post not found");
        }
        if (post.author != req.userData.userId) {
          throw AppError.inaccessible();
        }

        await PostsCtrl.delete(req.body.postId);
        if (post.community) {
          await CommunitiesCtrl.delPost(post.community, post._id);
        }
        
        res.onSuccess({}, "Post deleted");
      } catch (e) {
        next(e);
      }
    });

router.route('/user/:userId')
  .get(
    isLoggedIn(),
    query('action').exists(),
    validationResult,
    async (req, res, next) => {
      try {
        if (req.query.action == 'posts') {
          const userPosts = await PostsCtrl.find(
            {
              author: req.params.userId,
              community: null
            },
            req.userData.userId,
            req.query.page
          );
          res.onSuccess(userPosts, "");
        } else if (req.query.action == 'postsCount') {
          const count = await PostsCtrl.count({
            author: req.params.userId,
            community: null
          });
          res.onSuccess(count, "");
        } else {
          throw AppError.badRequest("Unknown action");
        }
      } catch (e) {
        next(e);
      }
    });

router.route('/like/:postId')
  .post(
    isLoggedIn(),
    param('postId').exists(),
    validationResult,
    async (req, res, next) => {
      try {
        const result = await PostsCtrl.toggleLike(req.params.postId, req.userData.userId);
        res.onSuccess(result, "");
      } catch (e) {
        next(e);
      }
    });


router.route('/comments/:postId')
  .get(
    isLoggedIn(),
    query('page').exists().isNumeric(),
    validationResult,
    async (req, res, next) => {
      try {
        const comments = await PostsCtrl.getComments(req.params.postId, req.query.page);
        if (!comments) {
          throw AppError.notFound('Comments not found');
        }
        res.onSuccess(comments, "");
      } catch (e) {
        next(e);
      }
    })
  .post(
    isLoggedIn(),
    body('text')
      .exists().bail()
      .isString().bail()
      .isLength({ min: 1 }).bail(),
    validationResult,
    async (req, res, next) => {
      try {
        const post = await PostsCtrl.getById(req.params.postId);
        if (!post) {
          throw AppError.notFound('Post not found');
        }

        const comment = await PostsCtrl.addComment(
          req.params.postId,
          req.userData.userId,
          req.body.text
        );
        
        res.onSuccess({
          commentsCount: post.comments + 1,
          comment: comment,
        }, "Comment created");
      } catch (e) {
        next(e);
      }
    })
  .delete(
    isLoggedIn(),
    body('commentId').exists(),
    validationResult,
    async (req, res, next) => {
      try {
        const comment = await CommentsCtrl.getById(req.body.commentId);
        const post = await PostsCtrl.getById(req.params.postId);

        if (!comment) {
          throw AppError.notFound("Comment not found");
        }
        if (!post) {
          throw AppError.notFound("Post not found");
        }
        if (
          comment.userId != req.userData.userId &&
          post.author != req.userData.userId
        ) {
          throw AppError.inaccessible();
        }

        await PostsCtrl.delComment(req.params.postId, req.body.commentId);
        res.onSuccess({ commentsCount: post.comments - 1 }, "Comment deleted");
      } catch (e) {
        next(e);
      }
    });

router.route('/liked')
  .get(
    isLoggedIn(),
    query('page').isNumeric(),
    validationResult,
    async (req, res, next) => {
      try {
        const result = await PostsCtrl.findLiked(req.userData.userId, req.query.page);
        res.onSuccess(result, "");
      } catch (e) {
        next(e);
      }
    });

module.exports = router;
