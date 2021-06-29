const fs = require('fs');
const mongoose = require('mongoose');
const randomstring = require("randomstring");

const User = require('../models/user');
const UserCommon = require('../models/user-common');
const bcrypt = require('../managers/bcrypt');
const TokenManager = require('../managers/token-manager');
const Mail = require('../managers/mail-manager');
const AppError = require('../managers/app-error');
const UserDto = require('../dtos/user-dto');

class UserService {
  static async getById(id) {
    return User.findById(id).lean();
  }
  
  static async getByEmail(email) {
    return User.findOne({ email }).lean();
  }

  static async getByUsername(username) {
    return User.findOne({ username }).lean();
  }

  static async signup(email, username, firstname, lastname, password) {
    if (await User.exists({ email })) {
      throw AppError.badRequest('Email is already taken');
    }
    if (await User.exists({ username })) {
      throw AppError.badRequest('Username is already taken');
    }
    
    const token = randomstring.generate(32);
    const user = new User({
      email,
      username,
      firstname,
      lastname,
      password: await bcrypt.hash(password),
      token
    }).save();

    Mail.sendSignupMail(email, token);
    return user;
  }

  static async verify(token) {
    const user = await User.findOne({ token }).select("+password +token +email");
    if (!user) {
      throw AppError.notFound('User not found');
    }

    user.isverified = true;
    user.token = "";
    return user.save();
  }

  static async signin(login, password) {
    let user;
    if (login.includes("@")) {
      user = await User.findOne({ email: login }).select("+password +token +email");
    } else {
      user = await User.findOne({ username: login }).select("+password +token +email");
    }

    if (!user || !user.isverified) {
      throw AppError.badRequest("Wrong login or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw AppError.badRequest("Wrong login or password");
    }

    const accessToken = TokenManager.encode({
      userId: user._id
    });
    if (!accessToken) {
      throw AppError.badRequest('token error');
    }

    return accessToken;
  }

  static async forgot(email) {
    const user = await User.findOne({ email });

    if (!user) {
      throw AppError.badRequest("User not found");
    }
    if (!user.isverified) {
      throw AppError.badRequest("User is not verified");
    }

    user.token = randomstring.generate(32);
    user.save();

    await Mail.sendChangePassMail(email, user.token);
  }

  static async resetPassword(password, resetToken) {
    const user = await User.findOne({ token: resetToken });
    if (!user) {
      throw AppError.notFound("User not found");
    }

    user.password = await bcrypt.hash(password);
    user.token = "";
    user.save();
  }

  static async search(query) {
    return UserCommon.find({
      $or: [
        { firstname: { "$regex": query, "$options": "i" } },
        { lastname: { "$regex": query, "$options": "i" } },
        { username: { "$regex": query, "$options": "i" } }
      ]
    }).limit(10);
  }

  static async edit(userId, params) {
    await User.updateOne({ _id: userId }, params);
  }

  static async getProfileById(userId, isFriend) {
    let user = await UserService.getById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    return UserService.getProfile(user, isFriend);
  }
  
  static async getProfileByUsername(username, isFriend) {
    let user = await UserService.getByUsername(username);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    return UserService.getProfile(user, isFriend);
  }

  static async getProfile(user, isFriend) {
    const udto = new UserDto(user);
    user = udto.fullInfo(udto.getInfoOptions(isFriend));
    user.isFriend = isFriend;
    return user;
  }

  static async updateAvatar(userId, avatar) {
    const user = await UserService.getById(userId);
    const oldAvatar = user.avatar;
    await User.updateOne({ _id: userId }, { avatar });
    if (oldAvatar != 'default_avatar.png') {
      await fs.promises.unlink(__homedir + '/public/uploads/' + oldAvatar);
    }
  }

  static async addCommunity(userId, communityId) {
    await User.updateOne({ _id: userId }, {
      $push: {
        communities: {
          $each: [communityId],
          $position: 0
        }
      }
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
    communities = await User.populate(communities, {
      path: 'followingCommunities',
      options: {
        lean: true
      }
    });

    return communities[0].followingCommunities;
  }

  static async getUserCommunities(userId, page) {
    let communities = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          communities: { $slice: [ '$communities', (page - 1) * 10, 10 ] } 
        }
      }
    ]);
    
    communities = await User.populate(communities, {
      path: 'communities',
      options: {
        lean: true
      }
    });
    return communities[0].communities;
  }

  static async followCommunity(userId, communityId) {
    return User.updateOne({ _id: userId }, {
      $push: {
        followingCommunities: {
          $each: [communityId],
          $position: 0
        }
      },
      $inc: { followingCommunitiesCount: 1 }
    });
  }

  static async unfollowCommunity(userId, communityId) {
    return User.updateOne({ _id: userId }, {
      $pull: {
        followingCommunities: communityId
      },
      $inc: { followingCommunitiesCount: -1 }
    });
  }
}

module.exports = UserService;
