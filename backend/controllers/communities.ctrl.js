const Community = require('../models/community');
const mongoose = require('mongoose');
const LikesCtrl = require('./likes.ctrl');
const UsersCtrl = require('./users.ctrl');

class CommunitiesCtrl {
  static getById(id) {
    return Community.findById(id);
  }

  static add(params) {
    const community = new Community(params);
    return community.save();
  }

  static find(params) {
    return Community.find(params)
      .limit(10)
      .exec();
  }

  static addFollower(communityId, userId) {
    return Community.updateOne(
      { _id: communityId },
      {
        $addToSet: { followers: userId },
        $inc: { followersCount: 1 }
      }
    );
  }

  static removeFollower(communityId, userId) {
    return Community.updateOne(
      { _id: communityId },
      {
        $pull: { followers: userId },
        $inc: { followersCount: -1 }
      }
    );
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

  static addPost(communityId, postId) {
    return Community.updateOne(
      { _id: communityId },
      {
        $push: {
          posts: {
            $each: [postId],
            $position: 0
          }
        },
        $inc: { postsCount: 1 }
      }
    );
  }

  static delPost(communityId, postId) {
    return Community.updateOne(
      { _id: communityId },
      {
        $pull: { posts: postId },
        $inc: { postsCount: -1 }
      }
    );
  }

  static async getPosts(communityId, userId, page) {
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

    for (const post of posts) {
      post.isLiked = await LikesCtrl.exists(post._id, userId);
    }

    return posts;
  }
  
  static async getUserFollowingCommunities(userId, loggedUserId, page) {
    const communities = await UsersCtrl.getFollowingCommunities(userId, page);
    
    for (const community of communities) {
      community.isFollowed = await CommunitiesCtrl.isFollower(community._id, loggedUserId);
    }

    return communities;
  }

  static async getUserCommunities(userId, loggedUserId, page) {
    const communities = await UsersCtrl.getCommunities(userId, page);
    
    for (const community of communities) {
      community.isFollowed = await CommunitiesCtrl.isFollower(community._id, loggedUserId);
    }

    return communities;
  }

  static findOneAndUpdate(params, newData) {
    return Community.updateOne(params, newData);
  }
}

module.exports = CommunitiesCtrl;
