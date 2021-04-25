const Like = require('../models/like');

class LikesCtrl {
  static add(params) {
    const like = new Like(params);
    return like.save();
  }

  static delOne(params) {
    return Like.deleteOne(params);
  }

  static delMany(params) {
    return Like.deleteMany(params);
  }

  static getByUser(userId) {
    return Like.find({ userId: userId });
  }

  static getByPost(postId) {
    return Like.find({ postId: postId });
  }

  static exists(postId, userId) {
    return Like.exists({
      postId: postId,
      userId: userId
    });
  }
}

module.exports = LikesCtrl;
