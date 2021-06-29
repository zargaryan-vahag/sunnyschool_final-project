const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const Dialog = require('../models/dialog');
const AppError = require('../managers/app-error');

class DialogService {
  static dialogUsersQuery(user1, user2) {
    return [
      {
        $and: [
          { user1: user1 },
          { user2: user2 }
        ]
      },
      {
        $and: [
          { user1: user2 },
          { user2: user1 }
        ]
      }
    ];
  }

  static getMessagesLimit(totalCount, page) {
    let limit = 25;
    let offset = totalCount - page * limit;
    if (offset < 0) {
      offset = 0;
      limit = totalCount - (page - 1) * limit;
    }

    const result = { offset, limit };

    if (page * limit - totalCount < 25 && limit > 0) {
      result.lastPage = false;
    }

    return result;
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

  static async getMessagesByDialogId(dialogId, user1, user2, page) {
    const dialog = await Dialog.aggregate([
      {
        $match: { 
          $and: [
            { _id: ObjectId(dialogId) },
            { $or: DialogService.dialogUsersQuery(ObjectId(user1), ObjectId(user2)) }
          ]
        }
      },
      {
        $project: { messagesCount: { $size: '$messages' } }
      }
    ]);
    if (!dialog[0]) {
      throw AppError.notFound('Dialog not found');
    }

    const result = DialogService.getMessagesLimit(dialog[0].messagesCount, page);
    
    if (!result.lastPage) {
      return Dialog.findOne({ _id: dialog[0]._id }, {
        messages: {
          $slice: [result.offset, result.limit]
        }
      }).select("+messages")
        .lean()
        .exec();
    }
  }

  static async getMessages(user1, user2, page) {
    const dialog = await Dialog.aggregate([
      {
        $match: {
          $or: DialogService.dialogUsersQuery(ObjectId(user1), ObjectId(user2))
        }
      },
      {
        $project: { messagesCount: { $size: '$messages' } }
      }
    ]);
    if (!dialog[0]) {
      throw AppError.notFound('Dialog not found');
    }

    const result = DialogService.getMessagesLimit(dialog[0].messagesCount, page);
    
    if (!result.lastPage) {
      return Dialog.findOne({ _id: dialog[0]._id }, {
        messages: {
          $slice: [result.offset, result.limit]
        }
      }).select("+messages")
        .exec();
    }
  }

  static async newMessage(from, to, text) {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const dialog = await Dialog.findOneAndUpdate({
      $or: DialogService.dialogUsersQuery(from, to)
    }, {
      user1: from,
      user2: to,
      read: to,
      $push: {
        messages: {
          userId: from,
          text
        }
      }
    }, options);
    
    return Dialog.findById(dialog._id, {
      messages: { $slice: -1 }
    }).select("+messages")
      .populate("messages.userId")
      .exec();
  }

  static async read(dialogId, userId) {
    return Dialog.updateOne({
      _id: dialogId,
      read: userId
    }, {
      read: null
    });
  }

  static async hasUnreadMessage(userId) {
    return Dialog.exists({
      $and: [
        {
          $or: [
            { user1: ObjectId(userId) },
            { user2: ObjectId(userId) }
          ]
        },
        { read: ObjectId(userId) }
      ]
    })
  }

  static async getMessage(dialogId, messageId) {
    return Dialog.findOne({
      _id: dialogId,
      "messages._id": messageId
    }, {
      "messages.$": 1
    }).select("+messages")
      .populate("messages.userId")
      .lean()
      .exec();
  }

  static async deleteMessage(dialogId, messageId) {
    return Dialog.updateOne({ _id: dialogId }, {
      $pull: {
        messages: { _id: messageId }
      }
    });
  }
}

module.exports = DialogService;
