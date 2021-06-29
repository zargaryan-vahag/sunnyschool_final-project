const fs = require('fs');
const { validationResult } = require('express-validator');

const PostService = require('../services/post-service');
const CommunityService = require('../services/community-service');
const UserService = require('../services/user-service');
const UserDto = require('../dtos/user-dto');
const AppError = require('../managers/app-error');

class PostController {
  static async getPosts(req, res, next) {
    try {
      const posts = await PostService.getNews(req.userData.userId, req.query.page);
      res.onSuccess(posts);
    } catch (e) {
      next(e);
    }
  }

  static async createPost(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!req.userData) {
        throw AppError.unauthorized();
      }
      if (!errors.isEmpty()) {
        throw AppError.badRequest("Validation Error", errors.mapped());
      }
      if (
        req.files && req.files.length === 0 && 
        req.body.postText && req.body.postText == ''
      ) {
        throw AppError.badRequest("Post must contain file, text or both");
      }

      if (req.body.communityId) {
        const hasAccess = await CommunityService.hasAccess(
          req.body.communityId,
          req.userData.userId
        );
        if (!hasAccess) {
          throw AppError.inaccessible('Access to community denied');
        }
      } else {
        req.body.communityId = null;
      }
      
      const files = req.files ? req.files.map(file => file.filename) : [];
      const newPost = await PostService.createPost(
        req.userData.userId,
        req.body.postText.trim(),
        req.body.communityId,
        files
      );

      if (req.body.communityId) {
        await CommunityService.addPost(req.body.communityId, newPost._id);
      }

      newPost.author = await UserService.getById(newPost.author);
      const udto = new UserDto(newPost.author);
      newPost.author = udto.commonInfo();
      
      res.onSuccess(newPost, "Post created");
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
  }

  static async deletePost(req, res, next) {
    try {
      const post = await PostService.getById(req.body.postId);
      let hasAccess;

      if (!post) {
        throw AppError.notFound('Post not found');
      }

      if (post.community) {
        hasAccess = await CommunityService.hasAccess(post.community, req.userData.userId);
      } else {
        hasAccess = await PostService.hasAccess(post, req.userData.userId)
      }

      if (!hasAccess) {
        throw AppError.inaccessible('Acces to post denied');
      }

      await PostService.deletePost(req.body.postId);
      if (post.community) {
        await CommunityService.delPost(post.community, post._id);
      }

      res.onSuccess({}, "Post deleted");
    } catch (e) {
      next(e);
    }
  }

  static async getUserPosts(req, res, next) {
    try {
      if (req.query.action == 'posts') {
        const userPosts = await PostService.getUserPosts(req.params.userId, req.query.page);
        res.onSuccess(userPosts);
      } else if (req.query.action == 'postsCount') {
        const count = await PostService.getUserPostsCount(req.params.userId);
        res.onSuccess(count);
      } else {
        throw AppError.badRequest("Unknown action");
      }
    } catch (e) {
      next(e);
    }
  }

  static async getLikedPosts(req, res, next) {
    try {
      const posts = await PostService.getLikedPosts(req.userData.userId, req.query.page);
      res.onSuccess(posts);
    } catch (e) {
      next(e);
    }
  }

  static async like(req, res, next) {
    try {
      const result = await PostService.toggleLike(req.params.postId, req.userData.userId);
      res.onSuccess(result);
    } catch (e) {
      next(e);
    }
  }

  static async createPostComment(req, res, next) {
    try {
      const post = await PostService.getById(req.params.postId);
      if (!post) {
        throw AppError.notFound('Post not found');
      }

      const comment = await PostService.createPostComment(
        req.params.postId,
        req.userData.userId,
        req.body.text
      );
      
      res.onSuccess({
        commentsCount: post.comments + 1,
        comment,
      }, "Comment created");
    } catch (e) {
      next(e);
    }
  }

  static async getPostComments(req, res, next) {
    try {
      const comments = await PostService.getPostComments(req.params.postId, req.query.page);
      if (!comments) {
        throw AppError.notFound('Comments not found');
      }
      
      res.onSuccess(comments);
    } catch (e) {
      next(e);
    }
  }

  static async deletePostComment(req, res, next) {
    try {
      const post = await PostService.getById(req.params.postId);
      if (!post) {
        throw AppError.notFound('Post not found');
      }
      if (!post.community && !PostService.hasAccess(post, req.userData.userId)) {
        throw AppError.inaccessible();
      }
      if (post.community) {
        const hasAccess = await CommunityService.hasAccess(post.community, req.userData.userId);
        if (!hasAccess) {
          throw AppError.inaccessible();
        }
      }

      await PostService.deletePostComment(req.params.postId, req.body.commentId);
      res.onSuccess({ commentsCount: post.comments - 1 }, "Comment deleted");
    } catch (e) {
      next(e);
    }
  }
}

module.exports = PostController;
