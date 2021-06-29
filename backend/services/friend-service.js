const mongoose = require('mongoose');

const User = require('../models/user');
const UserCommon = require('../models/user-common');
const FRequest = require('../models/friend-request');
const AppError = require('../managers/app-error');

class FriendService {
  static async isFriend(user1, user2) {
    if (user1 == user2) {
      return false;
    }
    
    const result = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(user1) } },
      {
        $project: {
          isFriend : {
            $in: [ mongoose.Types.ObjectId(user2), "$friends.userId" ]
          }
        }
      }
    ]);

    if (!result || !result[0] || result[0].isFriend === undefined) {
      throw AppError.badRequest('something went wrong in friend check');
    }

    return result[0].isFriend;
  }

  static async getFriendRequests(userId) {
    return FRequest.find({ to: userId }).populate('from');
  }

  static async checkRequest(user1, user2) {
    return FRequest.findOne({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 }
      ]
    });
  }

  static async sendRequest(from, to) {
    const user = await User.findById(to);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const requestSent = await FriendService.checkRequest(from, to);

    if (!requestSent) {      
      if (await FriendService.isFriend(from, to)) {
        throw AppError.badRequest("User is already in friendlist");
      }
      
      const fr = new FRequest({ from, to });
      fr.save();

      if (onlineUsers.has(to)) {
        const fromUser = await UserCommon.findById(from).lean();
        onlineUsers.get(to).emit('friend_request', fromUser);
      }

      return { sent: true };
    } else if (requestSent.to == from) {
      await FriendService.acceptRequest(requestSent._id);
      return { accepted: true };
    } else {
      throw AppError.badRequest("Request is already sent");
    }
  }

  static async acceptRequest(_id) {
    const fr = await FRequest.findById(_id);

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

    await FRequest.deleteOne({ _id });
  }

  static async requestsCount(to) {
    return FRequest.countDocuments({ to });
  }

  static async unfriend(user1, user2) {
    return Promise.all([
      User.updateOne({ _id: user1 }, {
        $pull: {
          friends: { userId: user2 }
        }
      }),
      User.updateOne({ _id: user2 }, {
        $pull: {
          friends: { userId: user1 }
        }
      })
    ]);
  }

  static async refuseRequest(from, to) {
    await FRequest.deleteOne({ from, to });

    if (onlineUsers.has(to)) {
      onlineUsers.get(to).emit('refused_friend_request');
    }
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
    
    const result = await User.populate(friends[0], {
      path: 'friends.userId',
      options: { lean: true }
    });
    return result.friends;
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
}

module.exports = FriendService;
