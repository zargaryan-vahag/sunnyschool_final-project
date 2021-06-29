const mongoose = require('mongoose');

const DialogService = require('../services/dialog-service');
const UserService = require('../services/user-service');
const AppError = require('../managers/app-error');

class DialogController {
  static async getDialogs(req, res, next) {
    try {
      const dialogs = await DialogService.getUserDialogs(req.userData.userId);
      for (const dialog of dialogs) {
        const interlocutor = (dialog.user1 == req.userData.userId) ? dialog.user2 : dialog.user1;
        dialog.interlocutor = await UserService.getById(interlocutor);
      }
      res.onSuccess(dialogs);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = DialogController;
