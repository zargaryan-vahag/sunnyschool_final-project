const mongoose = require('mongoose');
const Dialog = require('../models/dialog');

class DialogCtrl {
  static getById(dialogId) {
    return Dialog.findById(dialogId);
  }

  static async getUserDialogs(userId) {
    return Dialog.find({
      $or: [
        { user1: userId },
        { user2: userId }
      ]
    }, {
      messages: { $slice: -1 }
    }).select("+messages")
      .populate("messages.userId")
      .sort({ "messages.createdAt": -1 })
      .lean()
      .exec();
  }

  static async newMessage(params) {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    
    const dialog = await Dialog.findOneAndUpdate({
      $or: [
        {
          $and: [
            {user1: params.from },
            {user2: params.to }
          ]
        }, {
          $and: [
            {user1: params.to },
            {user2: params.from }
          ]
        }
      ]
    }, {
      user1: params.from,
      user2: params.to,
      read: params.to,
      $push: {
        messages: {
          userId: params.from,
          text: params.text
        }
      }
    }, options);
    
    return Dialog.findById(dialog._id, {
      messages: { $slice: -1 }
    }).select("+messages")
      .populate("messages.userId")
      .exec();
  }

  static async getMessages(params) {
    const dialog = await Dialog.aggregate([
      {
        $match: { 
          $or: [
            {
              $and: [
                { user1: mongoose.Types.ObjectId(params.user1) },
                { user2: mongoose.Types.ObjectId(params.user2) }
              ]
            },
            {
              $and: [
                { user1: mongoose.Types.ObjectId(params.user2) },
                { user2: mongoose.Types.ObjectId(params.user1) }
              ]
            }
          ]
        }
      }, {
        $project: { messagesCount: { $size: '$messages' } }
      }
    ]);
    
    if (dialog[0]) {
      const messagesCount = dialog[0].messagesCount
      let limit = 15;
      let offset = messagesCount - params.page * limit;
      if (offset < 0) {
        offset = 0;
        limit = messagesCount - (params.page - 1) * limit;
      }
      
      if (params.page * limit - messagesCount < 15 && limit > 0) {
        return Dialog.findOne({
          _id: dialog[0]._id
        }, {
          messages: {
            $slice: [offset, limit]
          }
        }).select("+messages")
          .exec();
      }
    }
  }

  static async getMessagesByDialogId(params) {
    const dialog = await Dialog.aggregate([
      {
        $match: { 
          $and: [
            {
              _id: mongoose.Types.ObjectId(params.dialogId)
            },
            {
              $or: [
                {
                  $and: [
                    { user1: mongoose.Types.ObjectId(params.user1) },
                    { user2: mongoose.Types.ObjectId(params.user2) }
                  ]
                },
                {
                  $and: [
                    { user1: mongoose.Types.ObjectId(params.user2) },
                    { user2: mongoose.Types.ObjectId(params.user1) }
                  ]
                }
              ]
            }
          ]
        }
      }, {
        $project: { messagesCount: { $size: '$messages' } }
      }
    ]);
    
    const messagesCount = dialog[0].messagesCount
    let limit = 15;
    let offset = messagesCount - params.page * limit;
    if (offset < 0) {
      offset = 0;
      limit = messagesCount - (params.page - 1) * limit;
    }
    
    if (params.page * limit - messagesCount < 15 && limit > 0) {
      return Dialog.findOne({
        _id: dialog[0]._id
      }, {
        messages: {
          $slice: [offset, limit]
        }
      }).select("+messages")
        .exec();
    }
  }

  static read(dialogId, userId) {
    return Dialog.updateOne({
      _id: dialogId,
      read: userId
    }, {
      read: null
    });
  }

  static hasUnreadMessage(userId) {
    return Dialog.exists({
      $and: [
        {
          $or: [
            { user1: mongoose.Types.ObjectId(userId) },
            { user2: mongoose.Types.ObjectId(userId) }
          ]
        },
        { read: mongoose.Types.ObjectId(userId) }
      ]
    })
  }
}

module.exports = DialogCtrl;
