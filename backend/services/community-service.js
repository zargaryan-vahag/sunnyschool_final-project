const fs = require('fs');
const mongoose = require('mongoose');

const Community = require('../models/community');
const UserService = require('../services/user-service');
const AppError = require('../managers/app-error');

class CommunityService {
  static async getById(id) {
    return Community.findById(id).lean();
  }

  static async hasAccess(communityId, userId) {
    const community = await Community.findById(communityId);

    if (!community) {
      throw AppError.notFound('Community not found');
    }

    return community.creatorId == userId;
  }

  static async addPost(communityId, postId) {
    return Community.updateOne({ _id: communityId }, {
      $push: {
        posts: {
          $each: [postId],
          $position: 0
        }
      },
      $inc: { postsCount: 1 }
    });
  }

  static async delPost(communityId, postId) {
    return Community.updateOne({ _id: communityId }, {
      $pull: { posts: postId },
      $inc: { postsCount: -1 }
    });
  }

  static async search(q) {
    return Community.find({
      name: { "$regex": q, "$options": "i" }
    }).limit(10);
  }

  static async createCommunity(creatorId, name) {
    const community = new Community({ creatorId, name }).save();
    await UserService.addCommunity(creatorId, community._id);

    return community;
  }

  static async isFollower(communityId, userId) {
    const check = await Community.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(communityId) } },
      {
        $project: {
          isFollower : {
            $in: [ mongoose.Types.ObjectId(userId), "$followers" ]
          }
        }
      }
    ]);
    
    return check[0].isFollower;
  }

  static async toggleFollow(communityId, userId) {
    const isFollower = await CommunityService.isFollower(communityId, userId);
    if (isFollower) {
      await UserService.unfollowCommunity(userId, communityId);
      await CommunityService.deleteFollower(communityId, userId);
      return { followed: false };
    } else {
      await UserService.followCommunity(userId, communityId);
      await CommunityService.addFollower(communityId, userId);
      return { followed: true };
    }
  }

  static async deleteFollower(communityId, userId) {
    return Community.updateOne({ _id: communityId }, {
      $pull: { followers: userId },
      $inc: { followersCount: -1 }
    });
  }

  static async addFollower(communityId, userId) {
    return Community.updateOne({ _id: communityId }, {
      $addToSet: { followers: userId },
      $inc: { followersCount: 1 }
    });
  }

  static async getCommunityPosts(communityId, page) {
    let posts = await Community.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(communityId) } },
      {
        $project: {
          posts: { $slice: [ '$posts', (page - 1) * 10, 10 ] } 
        }
      }
    ]);

    posts = await Community.populate(posts, {
      path: 'posts',
      populate : {
        path : 'author'
      },
      options: { lean: true }
    });
    posts = posts[0].posts;

    return posts;
  }

  static async updateAvatar(communityId, avatar) {
    const community = await Community.findById(communityId);
    await Community.updateOne({ _id: communityId }, { avatar });
    if (community.avatar != "default_community_image.png") {
      await fs.promises.unlink(__homedir + '/public/uploads/' + community.avatar);
    }
  }
}

module.exports = CommunityService;
