const mongoose = require('mongoose');
const User = require('../models/user');
const FRequestCtrl = require('./friend-request.ctrl');

class UsersCtrl {
  static getById(id) {
    return User.findById(id);
  }

  static exists(params) {
    return User.exists(params);
  }

  static add(params) {
    const user = new User(params);
    return user.save();
  }

  static find(params) {
    return User.find(params)
      .limit(10)
      // .sort({ firstname: -1, lastname: -1 })
      .exec();
  }

  static findOne(params) {
    return User.findOne(params);
  }

  static findOneAndUpdate(params, newData) {
    return User.updateOne(params, newData);
  }

  static editById(id, params) {
    return User.updateOne({ _id: id }, params);
  }

  static async friendRequest(params) {
    const check = await Promise.all([
      await UsersCtrl.checkFriend(params.from, params.to),
      await UsersCtrl.checkFriend(params.to, params.from)
    ]);
    
    if (check[0][0].isFriend && check[1][0].isFriend) {
      throw new Error("User is already in friendlist");
    } else {
      return FRequestCtrl.add(params);
    }
  }

  static checkFriend(from, to) {
    return User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(from) } },
      {
        $project: {
          isFriend : {
            $in: [ mongoose.Types.ObjectId(to), "$friends.userId" ]
          }
        }
      }
    ]);
  }

  static getFriendRequests(userId) {
    return FRequestCtrl.find({ to: userId });
  }

  static async acceptFriendRequest(id) {
    const fr = await FRequestCtrl.getById(id);

    await User.updateOne({
      _id: fr.from
    }, {
      $addToSet: {
        friends: { userId: fr.to }
      }
    });

    await User.updateOne({
      _id: fr.to
    }, {
      $addToSet: {
        friends: { userId: fr.from }
      }
    });

    await FRequestCtrl.delOne({ _id: id });
  }

  static unfriend(from, friend) {
    return Promise.all([
      User.updateOne({
        _id: from
      }, {
        $pull: {
          friends: { userId: friend }
        }
      }),

      User.updateOne({
        _id: friend
      }, {
        $pull: {
          friends: { userId: from }
        }
      })
    ]);
  }

  static async getFriends(userId, page) {
    const friends = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          friends: { $slice: [ '$friends', (page - 1) * 10, 10 ] } 
        }
      }
    ]);
    
    return User.populate(friends[0], { path: 'friends.userId' });
  }

  static async friendsCount(userId) {
    const friendsCount = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $project: { friendsCount: { $size: '$friends' } }
      }
    ]);
    
    return friendsCount[0].friendsCount;
  }

  static addNewCommunity(userId, communityId) {
    return User.updateOne({
      _id: userId
    }, {
      $push: {
        communities: {
          $each: [communityId],
          $position: 0
        }
      }
    });
  }

  static addFollowingCommunity(userId, communityId) {
    return User.updateOne({
      _id: userId
    }, {
      $push: {
        followingCommunities: {
          $each: [communityId],
          $position: 0
        }
      },
      $inc: { followingCommunitiesCount: 1 }
    });
  }

  static unFollowCommunity(userId, communityId) {
    return User.updateOne({
      _id: userId
    }, {
      $pull: {
        followingCommunities: communityId
      },
      $inc: { followingCommunitiesCount: -1 }
    });
  }

  static async getFollowingCommunities(userId, page) {
    let communities = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          followingCommunities: { $slice: [ '$followingCommunities', (page - 1) * 10, 10 ] } 
        }
      }
    ]);
    
    communities = await User.populate(communities, { path: 'followingCommunities', options: { lean: true } });
    return communities[0].followingCommunities || [];
  }

  static async getCommunities(userId, page) {
    let communities = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          communities: { $slice: [ '$communities', (page - 1) * 10, 10 ] } 
        }
      }
    ]);
    
    communities = await User.populate(communities, { path: 'communities', options: { lean: true } });
    return communities[0].communities;
  }
}

module.exports = UsersCtrl;
