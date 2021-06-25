const express = require('express');
const { body, param, query } = require('express-validator');
const fs = require('fs');

const router = express.Router();
const isLoggedIn = require('../middlewares/token-validator');
const validationResult = require('../middlewares/validation-result');
const upload = require('../middlewares/upload');
const UsersCtrl = require('../controllers/users.ctrl');
const FRequestCtrl = require('../controllers/friend-request.ctrl');
const AppError = require('../managers/app-error');

router.route('/')
  .get(
    isLoggedIn(),
    query('q').exists(),
    validationResult,
    async (req, res, next) => {
      try {
        const users = await UsersCtrl.find({
          $or: [
            { firstname: { "$regex": req.query.q, "$options": "i" } },
            { lastname: { "$regex": req.query.q, "$options": "i" } },
            { username: { "$regex": req.query.q, "$options": "i" } }
          ]
        });
        res.onSuccess(users, "");
      } catch (e) {
        next(e);
      }
    })
  .patch(
    isLoggedIn(),
    body('firstname', 'Invalid firstname')
      .exists()
      .isLength({ min: 2, max: 32 }).bail()
      .isAlpha(),
    body('lastname', 'Invalid lastname')
      .exists()
      .isLength({ min: 2, max: 32 }).bail()
      .isAlpha(),
    body('hometown')
      .exists()
      .isLength({ max: 32 }).bail(),
    body('gender')
      .exists()
      .isFloat({ min: 0, max: 2 }),
    validationResult,
    async (req, res, next) => {
      try {
        if (!req.body.birthday) {
          req.body.birthday = null;
        }
        await UsersCtrl.editById(req.userData.userId, {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          "info.hometown": req.body.hometown,
          "info.gender": req.body.gender,
          "info.birthday": req.body.birthday,
        });
        res.onSuccess({}, "User updated");
      } catch (e) {
        next(e);
      }
    });

router.route('/id/:id')
  .get(
    isLoggedIn(),
    async (req, res, next) => {
      try {
        const user = await UsersCtrl.getById(req.params.id);
        if (!user) {
          throw AppError.notFound('User not found');
        }

        const friendCheck = await UsersCtrl.checkFriend(req.userData.userId, user._id);
        const u = user.toObject();
        u.isFriend = friendCheck[0].isFriend;
        res.onSuccess(u);
      } catch (e) {
        next(e);
      }
    });

router.route('/username/:username')
  .get(
    isLoggedIn(),
    async (req, res, next) => {
      try {
        const user = await UsersCtrl.findOne({username: req.params.username});
        if (!user) {
          throw AppError.notFound('User not found');
        }

        const friendCheck = await UsersCtrl.checkFriend(req.userData.userId, user._id);
        const u = user.toObject();
        u.isFriend = friendCheck[0].isFriend;
        res.onSuccess(u);
      } catch (e) {
        next(e);
      }
    });

router.route('/avatar')
  .patch(
    upload.single('file'),
    isLoggedIn({ ignoreError: true }),
    async (req, res, next) => {
      try {
        const avatarExtensions = ['PNG', 'JPG', 'JPEG', 'GIF'];

        if (!req.userData) {
          throw AppError.unauthorized();
        }
        if (!req.file) {
          throw AppError.badRequest("Image not uploaded");
        }
        if (!avatarExtensions.includes(req.file.mimetype.split('/')[1].toUpperCase())) {
          throw AppError.badRequest("Unsupported file type");
        }

        const user = await UsersCtrl.getById(req.userData.userId);
        const oldAvatar = user.avatar;
        await UsersCtrl.findOneAndUpdate({
          _id: req.userData.userId
        }, {
          avatar: req.file.filename
        });
        if (oldAvatar != "default_avatar.png") {
          await fs.promises.unlink(__homedir + '/public/uploads/' + oldAvatar);
        }

        res.onSuccess({ avatar: req.file.filename }, "Avatar updated");
      } catch (e) {
        if (req.file) {
          await fs.promises.unlink(__homedir + '/public/uploads/' + req.file.filename);
        }
        next(e);
      }
    })
  .delete(
    isLoggedIn(),
    async (req, res, next) => {
      try {
        const user = await UsersCtrl.getById(req.userData.userId);
        const oldAvatar = user.avatar;
        await UsersCtrl.findOneAndUpdate({
          _id: req.userData.userId
        }, {
          avatar: 'default_avatar.png'
        });
        await fs.promises.unlink(__homedir + '/public/uploads/' + oldAvatar);
        res.onSuccess({ avatar: 'default_avatar.png' }, "Avatar updated");
      } catch (e) {
        next(e);
      }
    });

router.route('/friendrequest')
  .get(
    isLoggedIn(),
    async (req, res, next) => {
      try {
        const notifications = await UsersCtrl.getFriendRequests(req.userData.userId);
        res.onSuccess(notifications, "");
      } catch (e) {
        next(e);
      }
    })
  .post(
    isLoggedIn(),
    body('to').exists(),
    validationResult,
    async (req, res, next) => {
      try {
        if (req.userData.userId == req.body.to) {
          throw AppError.badRequest("You can't send request to yourself");
        }

        const user = await UsersCtrl.getById(req.body.to);
        if (!user) {
          throw AppError.notFound('User not found');
        }

        const check = await FRequestCtrl.findOne({
          $or: [
            { from: req.userData.userId, to: req.body.to },
            { to: req.userData.userId, from: req.body.to }
          ]
        });
        if (!check) {
          await UsersCtrl.friendRequest({
            from: req.userData.userId,
            to: req.body.to
          });

          const fromUser = await UsersCtrl.getById(req.userData.userId).lean();

          if (onlineUsers.has(req.body.to)) {
            onlineUsers.get(req.body.to).emit('friend_request', fromUser);
          }

          res.onSuccess({}, "Request sent");
        } else if (check.to == req.userData.userId) {
          await UsersCtrl.acceptFriendRequest(check._id);
          res.onSuccess({ accepted: true }, "Request accepted");
        } else {
          throw AppError.badRequest("Request is already sent");
        }
      } catch (e) {
        next(e);
      }
    });

router.route('/friendrequest/:userId')
  .get(
    isLoggedIn(),
    param('userId').exists(),
    validationResult,
    async (req, res, next) => {
      try {
        const request = await FRequestCtrl.findOne({
          $or: [
            {
              from: req.userData.userId,
              to: req.params.userId
            },
            {
              from: req.params.userId,
              to: req.userData.userId
            }
          ]
        });
        
        if (request) {
          res.onSuccess({ sent: true, from: request.from }, "");
        } else {
          res.onSuccess({ sent: false }, "");
        }
      } catch (e) {
        next(e);
      }
    });

router.route('/friendrequestcount')
  .get(
    isLoggedIn(),
    async (req, res, next) => {
      try {
        const count = await FRequestCtrl.count({ to: req.userData.userId });
        res.onSuccess(count, "");
      } catch (e) {
        next(e);
      }
    });

router.route('/isfriend/:userId')
  .get(
    isLoggedIn(),
    param('userId'),
    validationResult,
    async (req, res, next) => {
      try {
        const friend = await UsersCtrl.checkFriend(req.userData.userId, req.params.userId);
        res.onSuccess(friend, "");
      } catch (e) {
        next(e);
      }
    });

router.route('/unfriend/:userId')
  .delete(
    isLoggedIn(),
    param('userId'),
    validationResult,
    async (req, res, next) => {
      try {
        const check = await UsersCtrl.checkFriend(req.userData.userId, req.params.userId);
        if (!check[0].isFriend) {
          throw AppError.notFound("Friend not found");
        }
        
        const friend = await UsersCtrl.unfriend(req.userData.userId, req.params.userId);
        res.onSuccess(friend, "");
      } catch (e) {
        next(e);
      }
    });

router.route('/refusefriend/:userId')
  .delete(
    isLoggedIn(),
    param('userId'),
    validationResult,
    async (req, res, next) => {
      try {
        await FRequestCtrl.delOne({
          $or: [
            { from: req.params.userId, to: req.userData.userId },
            { from: req.userData.userId, to: req.params.userId }
          ]
        });

        if (onlineUsers.has(req.params.userId)) {
          onlineUsers.get(req.params.userId).emit('refused_friend_request');
        }

        res.onSuccess({}, "deleted");
      } catch (e) {
        next(e);
      }
    });

router.route('/friends/:userId')
  .get(
    isLoggedIn(),
    param('userId').exists(),
    query('page').exists(),
    validationResult,
    async (req, res, next) => {
      try {
        if (req.userData.userId == req.params.userId) {
          const friends = await UsersCtrl.getFriends(req.userData.userId, req.query.page);
          const result = [];
          
          for (let friend of friends.friends) {
            const fr = friend.userId.toObject();
            fr.isFriend = true;
            result.push(fr);
          }
          
          res.onSuccess(result, "");
        } else {
          const friends = await UsersCtrl.getFriends(req.params.userId, req.query.page);
          const result = [];
          
          for (let friend of friends.friends) {
            const fr = friend.userId.toObject();
            const check = await UsersCtrl.checkFriend(req.userData.userId, fr._id);

            fr.isFriend = check[0].isFriend;
            result.push(fr);
          }

          res.onSuccess(result, "");
        }
      } catch (e) {
        next(e);
      }
    });

router.route('/friendscount/:userId')
  .get(
    isLoggedIn(),
    param('userId').exists(),
    validationResult,
    async (req, res, next) => {
      try {
        const friendsCount = await UsersCtrl.friendsCount(req.params.userId);
        res.onSuccess(friendsCount, "");
      } catch (e) {
        next(e);
      }
    });

module.exports = router;
