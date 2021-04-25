const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const UsersCtrl = require('../controllers/users.ctrl');
const DialogCtrl = require('../controllers/dialogs.ctrl');
const AppError = require('../managers/app-error');
const validationResult = require('../middlewares/validation-result');
const isLoggedIn = require('../middlewares/token-validator');

router
  .get('/',
    isLoggedIn,
    async (req, res) => {
      try {
        const dialogs = await DialogCtrl.getUserDialogs(req.userData.userId);
        for (let dialog of dialogs) {
          const interlocutor = (dialog.user1 == req.userData.userId)
                                ? dialog.user2
                                : dialog.user1;
          dialog.interlocutor = await UsersCtrl.getById(interlocutor);
        }
        res.onSuccess(dialogs, "");
      } catch (e) {
        res.onError(new AppError(e.message, 400));
      }
    }
  );

module.exports = router;
