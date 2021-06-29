const fs = require('fs');
const { validationResult } = require('express-validator');

const CommunityService = require('../services/community-service');
const PostService = require('../services/post-service');
const UserService = require('../services/user-service');
const AppError = require('../managers/app-error');

class CommunityController {
  static async getCommunities(req, res, next) {
    try {
      const communities = await CommunityService.search(req.query.q);
      res.onSuccess(communities);
    } catch (e) {
      next(e);
    }
  }

  static async getCommunity(req, res, next) {
    try {
      const comm = await CommunityService.getById(req.params.commId);
      if (!comm) {
        throw AppError.notFound('Community not found');
      }

      res.onSuccess(comm);
    } catch (e) {
      next(e);
    }
  }

  static async getUserFollowingCommunities(req, res, next) {
    try {
      const user = await UserService.getById(req.params.userId);
      if (!user) {
        throw AppError.notFound("User not found");
      }
      
      const communities = await UserService.getFollowingCommunities(
        user._id,
        req.query.page
      );      
      for (const community of communities) {
        let isFollower = (req.userData.userId == req.params.userId);
        if (!isFollower) {
          isFollower = await CommunityService.isFollower(community._id, req.userData.userId);
        }
        community.isFollowed = isFollower;
      }
      
      res.onSuccess(communities);
    } catch (e) {
      next(e);
    }
  }

  static async getUserCommunities(req, res, next) {
    try {
      const user = await UserService.getById(req.params.userId);
      if (!user) {
        throw AppError.notFound("User not found");
      }

      const communities = await UserService.getUserCommunities(
        user._id,
        req.query.page
      );
      for (const community of communities) {
        let isFollower = (req.userData.userId == req.params.userId);
        if (!isFollower) {
          isFollower = await CommunityService.isFollower(community._id, req.userData.userId);
        }
        community.isFollowed = isFollower;
      }
      
      res.onSuccess(communities);
    } catch (e) {
      next(e);
    }
  }

  static async getCommunityPosts(req, res, next) {
    try {
      const posts = await CommunityService.getCommunityPosts(
        req.params.commId,
        req.query.page
      );

      for (const post of posts) {
        post.isLiked = await PostService.isLiked(post._id, req.userData.userId);
      }

      res.onSuccess(posts);
    } catch (e) {
      next(e);
    }
  }

  static async isFollower(req, res, next) {
    try {
      const isFollower = await CommunityService.isFollower(
        req.params.communityId,
        req.userData.userId
      );
      res.onSuccess(isFollower);
    } catch (e) {
      next(e);
    }
  }

  static async createCommunity(req, res, next) {
    try {
      const newCommunity = await CommunityService.createCommunity(
        req.userData.userId,
        req.body.name
      );

      res.onSuccess(newCommunity);
    } catch (e) {
      next(e);
    }
  }

  static async follow(req, res, next) {
    try {
      const community = await CommunityService.getById(req.params.commId);
      if (!community) {
        throw AppError.notFound("Community not found");
      }
      
      const result = await CommunityService.toggleFollow(
        req.params.commId,
        req.userData.userId
      );
      
      if (result.followed) {
        res.onSuccess({}, "followed");
      } else {
        res.onSuccess({}, "unfollowed");
      }
    } catch (e) {
      next(e);
    }
  }

  static async updateAvatar(req, res, next) {
    try {
      const avatarExtensions = ['PNG', 'JPG', 'JPEG', 'GIF'];
      const errors = validationResult(req);

      if (!req.userData) {
        throw AppError.unauthorized();
      }
      if (!errors.isEmpty()) {
        throw AppError.badRequest('Validation Error', errors.mapped());
      }
      if (!req.file) {
        throw AppError.badRequest("Image not uploaded");
      }
      if (!avatarExtensions.includes(req.file.mimetype.split('/')[1].toUpperCase())) {
        throw AppError.badRequest("Unsupported file type");
      }

      const community = await CommunityService.getById(req.body.communityId);
      if (!community) {
        throw AppError.notFound("Community not found");
      }
      if (!CommunityService.hasAccess(community._id, req.userData.userId)) {
        throw AppError.inaccessible();
      }

      await CommunityService.updateAvatar(community._id, req.file.filename);
      res.onSuccess({ avatar: req.file.filename }, "Avatar updated");
    } catch (e) {
      if (req.file) {
        await fs.promises.unlink(__homedir + '/public/uploads/' + req.file.filename);
      }
      next(e);
    }
  }

  static async deleteAvatar(req, res, next) {
    try {
      const community = await CommunityService.getById(req.body.communityId);
      if (!community) {
        throw AppError.notFound("Community not found");
      }
      if (!CommunityService.hasAccess(community._id, req.userData.userId)) {
        throw AppError.inaccessible();
      }

      await CommunityService.updateAvatar(req.body.communityId, 'default_community_image.png');
      res.onSuccess({ avatar: 'default_community_image.png' }, 'Avatar updated');
    } catch (e) {
      next(e);
    }
  }
}

module.exports = CommunityController;
