const express = require('express');
const { body, query, param, validationResult: vr } = require('express-validator');
const fs = require('fs');

const router = express.Router();
const UsersCtrl = require('../controllers/users.ctrl');
const PostsCtrl = require('../controllers/posts.ctrl');
const CommunitiesCtrl = require('../controllers/communities.ctrl');
const AppError = require('../managers/app-error');
const validationResult = require('../middlewares/validation-result');
const upload = require('../middlewares/upload');
const isLoggedIn = require('../middlewares/token-validator');

router
  .get('/',
    isLoggedIn(),
    query('q').exists(),
    validationResult,
    async (req, res, next) => {
      try {
        const communities = await CommunitiesCtrl.find({
          name: { "$regex": req.query.q, "$options": "i" }
        });
        res.onSuccess(communities, "");
      } catch (e) {
        next(e);
      }
    })
  .get('/:commId',
    isLoggedIn(),
    async (req, res, next) => {
      try {
        const comm = await CommunitiesCtrl.getById(req.params.commId);
        if (!comm) {
          throw AppError.notFound('Community not found');
        }
        res.onSuccess(comm, "");
      } catch (e) {
        next(e);
      }
    })
  .get('/userfollowing/:userId',
    isLoggedIn(),
    query('page').exists().isNumeric(),
    validationResult,
    async (req, res, next) => {
      try {
        const user = await UsersCtrl.getById(req.params.userId);
        if (!user) {
          throw AppError.notFound("User not found");
        }
        
        const communities = await CommunitiesCtrl.getUserFollowingCommunities(
          user._id,
          req.userData.userId,
          req.query.page
        );
        
        res.onSuccess(communities, "");
      } catch (e) {
        next(e);
      }
    })
  .get('/usercreated/:userId',
    isLoggedIn(),
    query('page').exists().isNumeric(),
    validationResult,
    async (req, res, next) => {
      try {
        const user = await UsersCtrl.getById(req.params.userId);
        if (!user) {
          throw AppError.notFound("User not found");
        }

        const communities = await CommunitiesCtrl.getUserCommunities(
          user._id,
          req.userData.userId,
          req.query.page
        );
        
        res.onSuccess(communities, "");
      } catch (e) {
        next(e);
      }
    })
  .get('/posts/:commId',
    isLoggedIn(),
    query('page').exists().isNumeric(),
    validationResult,
    async (req, res, next) => {
      try {
        const posts = await CommunitiesCtrl.getPosts(
          req.params.commId,
          req.userData.userId,
          req.query.page
        );
        res.onSuccess(posts, "");
      } catch (e) {
        next(e);
      }
    })
  .get('/isfollower/:communityId',
    isLoggedIn(),
    param('communityId').exists().isMongoId(),
    validationResult,
    async (req, res, next) => {
      try {
        const follower = await CommunitiesCtrl.isFollower(
          req.params.communityId,
          req.userData.userId
        );
        res.onSuccess(follower, "");
      } catch (e) {
        next(e);
      }
    })
  .post('/',
    isLoggedIn(),
    body('name').exists().isLength({ min: 1, max: 128 }),
    validationResult,
    async (req, res, next) => {
      try {
        const newComm = await CommunitiesCtrl.add({
          creatorId: req.userData.userId,
          name: req.body.name
        });

        await UsersCtrl.addNewCommunity(req.userData.userId, newComm._id);

        res.onSuccess(newComm, "");
      } catch (e) {
        next(e);
      }
    })
  .post('/togglefollow/:commId',
    isLoggedIn(),
    async (req, res, next) => {
      try {
        const comm = await CommunitiesCtrl.getById(req.params.commId);
        if (!comm) {
          throw AppError.notFound("Community not found");
        }
        
        const isFollower = await CommunitiesCtrl.isFollower(comm._id, req.userData.userId);
        if (isFollower) {
          await UsersCtrl.unFollowCommunity(req.userData.userId, comm._id);
          await CommunitiesCtrl.removeFollower(comm._id, req.userData.userId);
          res.onSuccess({}, "unfollowed");
        } else {
          await UsersCtrl.addFollowingCommunity(req.userData.userId, comm._id);
          await CommunitiesCtrl.addFollower(comm._id, req.userData.userId);
          res.onSuccess({}, "followed");
        }
      } catch (e) {
        next(e);
      }
    });

router.route('/avatar')
  .patch(
    upload.single('file'),
    isLoggedIn({ ignoreError: true }),
    body('communityId').exists().isMongoId(),
    async (req, res, next) => {
      try {
        const avatarExtensions = ['PNG', 'JPG', 'JPEG', 'GIF'];
        const errors = vr(req);

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

        const community = await CommunitiesCtrl.getById(req.body.communityId);

        if (!community) {
          throw AppError.notFound("Community not found");
        }
        if (community.creatorId != req.userData.userId) {
          throw AppError.inaccessible();
        }

        const oldAvatar = community.avatar;
        await CommunitiesCtrl.findOneAndUpdate({
          _id: req.body.communityId
        }, {
          avatar: req.file.filename
        });
        if (oldAvatar != "default_community_image.png") {
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
    body('communityId').exists().isMongoId(),
    validationResult,
    async (req, res, next) => {
      try {
        const community = await CommunitiesCtrl.getById(req.body.communityId);
        const oldAvatar = community.avatar;
        await CommunitiesCtrl.findOneAndUpdate({
          _id: req.body.communityId
        }, {
          avatar: 'default_community_image.png'
        });

        if (oldAvatar != "default_community_image.png") {
          await fs.promises.unlink(__homedir + '/public/uploads/' + oldAvatar);
        }
        res.onSuccess({ avatar: 'default_community_image.png' }, "Avatar updated");
      } catch (e) {
        next(e);
      }
    });

module.exports = router;
