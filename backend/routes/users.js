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
    isLoggedIn,
    query('q').exists(),
    async (req, res) => {
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
        res.onError(new AppError(e.message, 400));
      }
    }
  )
  .patch(
    isLoggedIn,
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
    async (req, res) => {
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
        res.onError(new AppError(e.message));
      }
    }
  )

router.route('/id/:id')
  .get(
    isLoggedIn,
    async (req, res) => {
      try {
        const user = await UsersCtrl.getById(req.params.id);

        if (user) {
          const friendCheck = await UsersCtrl.checkFriend(req.userData.userId, user._id);
          const u = user.toObject();
          u.isFriend = friendCheck[0].isFriend;
          res.onSuccess(u);
        } else {
          throw new Error('User not found');
        }
      } catch (e) {
        res.onError(new AppError(e.message, 404));
      }
    });

router.route('/username/:username')
  .get(
    isLoggedIn,
    async (req, res) => {
      try {
        const user = await UsersCtrl.findOne({username: req.params.username});

        if (user) {
          const friendCheck = await UsersCtrl.checkFriend(req.userData.userId, user._id);
          const u = user.toObject();
          u.isFriend = friendCheck[0].isFriend;
          res.onSuccess(u);
        } else {
          throw new Error('User not found');
        }
      } catch (e) {
        res.onError(new AppError(e.message, 404));
      }
    });

router.route('/avatar')
  .patch(
    upload.single('file'),
    async (req, res) => {
      try {
        const avatarExtensions = ['PNG', 'JPG', 'JPEG', 'GIF'];
        const loggedIn = await isLoggedIn(req, {onError() {
          return false;
        }}, () => {});

        if (loggedIn !== false) {
          if (!req.file) {
            throw new Error("Image not uploaded");
          }
          
          if (!avatarExtensions.includes(req.file.mimetype.split('/')[1].toUpperCase())) {
            throw new Error("Unsupported file type");
          }

          const user = await UsersCtrl.getById(req.userData.userId);

          if (!user) {
            throw new Error("User not found");
          }

          const oldAvatar = user.avatar;
          await UsersCtrl.findOneAndUpdate({ _id: req.userData.userId }, { avatar: req.file.filename });
          if (oldAvatar != "default_avatar.png") {
            await fs.promises.unlink(__homedir + '/public/uploads/' + oldAvatar);
          }

          res.onSuccess({ avatar: req.file.filename }, "Avatar updated");
        } else {
          throw new Error("Token not provided");
        }
      } catch (e) {
        if (req.file) {
          await fs.promises.unlink(__homedir + '/public/uploads/' + req.file.filename);
        }
        res.onError(new AppError(e.message, 400));
      }
    })
  .delete(
    isLoggedIn,
    async (req, res) => {
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
        res.onError(new AppError(e.message, 400));
      }
    }
  );

router.route('/friendrequest')
  .get(
    isLoggedIn,
    async (req, res) => {
      try {
        const notifications = await UsersCtrl.getFriendRequests(req.userData.userId);
        res.onSuccess(notifications, "");
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  )
  .post(
    isLoggedIn,
    body('to').exists(),
    validationResult,
    async (req, res) => {
      try {
        if (req.userData.userId == req.body.to) {
          throw new Error("You can't send request to yourself");
        }

        const user = await UsersCtrl.getById(req.body.to);
        if (user) {
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
            throw new Error("Request is already sent");
          }
        } else {
          throw new Error("User not found");
        }
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  );

router.route('/friendrequest/:userId')
  .get(
    isLoggedIn,
    param('userId').exists(),
    validationResult,
    async (req, res) => {
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
        res.onError(new AppError(e.message, 400));
      }
    }
  );

router.route('/friendrequestcount')
  .get(
    isLoggedIn,
    async (req, res) => {
      try {
        const count = await FRequestCtrl.count({ to: req.userData.userId });
        res.onSuccess(count, "");
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  );

router.route('/isfriend/:userId')
  .get(
    isLoggedIn,
    param('userId'),
    validationResult,
    async (req, res) => {
      try {
        const friend = await UsersCtrl.checkFriend(req.userData.userId, req.params.userId);
        res.onSuccess(friend, "");
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  );

router.route('/unfriend/:userId')
  .delete(
    isLoggedIn,
    param('userId'),
    validationResult,
    async (req, res) => {
      try {
        const check = await UsersCtrl.checkFriend(req.userData.userId, req.params.userId);
        
        if (check[0].isFriend) {
          const friend = await UsersCtrl.unfriend(req.userData.userId, req.params.userId);
          res.onSuccess(friend, "");
        } else {
          throw new Error("Friend not found");
        }
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  );

router.route('/refusefriend/:userId')
  .delete(
    isLoggedIn,
    param('userId'),
    validationResult,
    async (req, res) => {
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
        res.onError(new AppError(e.message, 400));
      }
    }
  );

router.route('/friends/:userId')
  .get(
    isLoggedIn,
    param('userId').exists(),
    query('page').exists(),
    validationResult,
    async (req, res) => {
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
        res.onError(new AppError(e.message, 400));
      }
    }
  );

router.route('/friendscount/:userId')
  .get(
    isLoggedIn,
    param('userId').exists(),
    async (req, res) => {
      try {
        const friendsCount = await UsersCtrl.friendsCount(req.params.userId);
        res.onSuccess(friendsCount, "");
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  )

module.exports = router;
