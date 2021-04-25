const mongoose = require('mongoose');
const Comment = require('../models/comment');

class CommentsCtrl {
  static getById(id) {
    return Comment.findById(id);
  }

  static exists(params) {
    return Comment.exists(params);
  }

  static add(params) {
    const comm = new Comment(params);
    return comm.save();
  }

  static del(params) {
    return Comment.deleteOne(params);
  }

  static delMany(params) {
    return Comment.deleteMany(params);
  }

  static find(params, page) {
    return Comment.find(params)
      .skip((page - 1) * 10)
      .limit(10)
      .sort({ createdAt: -1 })
      .populate('userId')
      .exec();
  }
}

module.exports = CommentsCtrl;
