const fs = require('fs');
const { validationResult } = require('express-validator');

const UserService = require('../services/user-service');
const FriendService = require('../services/friend-service');
const AppError = require('../managers/app-error');

class UserController {
  static async getUsers(req, res, next) {
    try {
      const users = await UserService.search(req.query.q);
      res.onSuccess(users);
    } catch (e) {
      next(e);
    }
  }

  static async updateUser(req, res, next) {
    try {
      if (!req.body.birthday) {
        req.body.birthday = null;
      }
      await UserService.edit(req.userData.userId, {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        info: {
          hometown: req.body.hometown,
          gender: parseInt(req.body.gender),
          birthday: req.body.birthday
        }
      });
      res.onSuccess({}, "User updated");
    } catch (e) {
      next(e);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const isFriend = await FriendService.isFriend(req.userData.userId, req.params.id);
      const user = await UserService.getProfileById(req.params.id, isFriend);
      res.onSuccess(user);
    } catch (e) {
      next(e);
    }
  }

  static async getUserByUsername(req, res, next) {
    try {
      let user = await UserService.getByUsername(req.params.username);
      const isFriend = await FriendService.isFriend(req.userData.userId, user._id);
      user = await UserService.getProfileByUsername(req.params.username, isFriend);
      res.onSuccess(user);
    } catch (e) {
      next(e);
    }
  }

  static async updateAvatar(req, res, next) {
    try {
      const avatarExtensions = ['PNG', 'JPG', 'JPEG', 'GIF'];
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw AppError.badRequest('Validation Error', errors.mapped());
      }
      if (!req.userData) {
        throw AppError.unauthorized();
      }
      if (!req.file) {
        throw AppError.badRequest("Image not uploaded");
      }
      if (!avatarExtensions.includes(req.file.mimetype.split('/')[1].toUpperCase())) {
        throw AppError.badRequest("Unsupported file type");
      }

      await UserService.updateAvatar(req.userData.userId, req.file.filename);
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
      await UserService.updateAvatar(req.userData.userId, 'default_avatar.png');
      res.onSuccess({ avatar: 'default_avatar.png' }, "Avatar updated");
    } catch (e) {
      next(e);
    }
  }

  static async getFriendRequest(req, res, next) {
    try {
      const notifications = await FriendService.getFriendRequests(req.userData.userId);
      res.onSuccess(notifications);
    } catch (e) {
      next(e);
    }
  }

  static async sendFriendRequest(req, res, next) {
    try {
      if (req.userData.userId == req.body.to) {
        throw AppError.badRequest("Can't send request to yourself");
      }

      const result = await FriendService.sendRequest(req.userData.userId, req.body.to);
      if (result.sent) {
        res.onSuccess({}, "Request sent");
      } else if (result.accepted) {
        res.onSuccess({ accepted: true }, "Request accepted");
      }
    } catch (e) {
      next(e);
    }
  }

  static async checkFriendRequest(req, res, next) {
    try {
      if (req.userData.userId == req.params.userId) {
        throw AppError.badRequest("Can't check to yourself");
      }
      const request = await FriendService.checkRequest(req.userData.userId, req.params.userId);
      
      if (request) {
        res.onSuccess({ sent: true, from: request.from });
      } else {
        res.onSuccess({ sent: false });
      }
    } catch (e) {
      next(e);
    }
  }

  static async getFriendRequestsCount(req, res, next) {
    try {
      const count = await FriendService.requestsCount(req.userData.userId);
      res.onSuccess(count);
    } catch (e) {
      next(e);
    }
  }
  
  static async checkFriend(req, res, next) {
    try {
      if (req.userData.userId == req.params.userId) {
        throw AppError.badRequest("Can't check to yourself");
      }

      const friend = await FriendService.isFriend(req.userData.userId, req.params.userId);
      res.onSuccess(friend);
    } catch (e) {
      next(e);
    }
  }

  static async unfriend(req, res, next) {
    try {
      if (req.userData.userId == req.params.userId) {
        throw AppError.badRequest("Can't unfriend to yourself");
      }

      const isFriend = await FriendService.isFriend(req.userData.userId, req.params.userId);
      if (!isFriend) {
        throw AppError.notFound("Friend not found");
      }
      
      await FriendService.unfriend(req.userData.userId, req.params.userId);
      res.onSuccess({}, "unfriended");
    } catch (e) {
      next(e);
    }
  }

  static async refuseFriendRequest(req, res, next) {
    try {
      if (req.userData.userId == req.params.userId) {
        throw AppError.badRequest("Can't refuse to yourself");
      }

      await FriendService.refuseRequest(req.params.userId, req.userData.userId);
      res.onSuccess({}, "refused");
    } catch (e) {
      next(e);
    }
  }

  static async getFriends(req, res, next) {
    try {
      const friends = await FriendService.getFriends(req.params.userId, req.query.page);
      const result = [];

      if (req.userData.userId == req.params.userId) {
        for (const friend of friends) {
          const fr = {...friend.userId};
          fr.isFriend = true;
          result.push(fr);
        }
      } else {
        for (const friend of friends) {
          const fr = {...friend.userId};
          fr.isFriend = await FriendService.isFriend(req.userData.userId, fr._id);
          result.push(fr);
        }
      }

      res.onSuccess(result);
    } catch (e) {
      next(e);
    }
  }

  static async getFriendsCount(req, res, next) {
    try {
      const count = await FriendService.friendsCount(req.params.userId);
      res.onSuccess(count);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = UserController;
