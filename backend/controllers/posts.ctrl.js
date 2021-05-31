const mongoose = require('mongoose');
const fs = require('fs');
const Post = require('../models/post');
const LikesCtrl = require('./likes.ctrl');
const CommentsCtrl = require('./comments.ctrl');

class PostsCtrl {
  static getById(id) {
    return Post.findById(id);
  }

  static exists(params) {
    return Post.exists(params);
  }

  static add(params) {
    const post = new Post(params);
    return post.save();
  }

  static findOne(params) {
    return Post.findOne(params);
  }

  static async find(params, userId, page) {
    const posts = await Post.find(params)
      .skip((page - 1) * 10)
      .limit(10)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const result = [];
    for (const post of posts) {
      post.isLiked = await LikesCtrl.exists(post._id, userId);
      result.push(post);
    }

    return result;
  }

  static getCommunityPost(id) {
    return Post.findById(id)
      .populate('author')
      .populate('community')
      .exec();
  }

  static async findNews(params, userId, page) {
    const posts = await Post.find(params)
      .skip((page - 1) * 10)
      .limit(10)
      .sort({ createdAt: -1 })
      .populate('author')
      .populate('community')
      .exec();

    const result = [];
    for (let post of posts) {
      post = post.toObject();
      post.isLiked = await LikesCtrl.exists(post._id, userId);
      result.push(post);
    }

    return result;
  }

  static async findLiked(userId, page) {
    const posts = await Post.find({
      "likedUsers.userId": userId
    }).skip((page - 1) * 10)
      .limit(10)
      .sort({ "likedUsers.createdAt": -1 })
      .populate('author')
      .populate('community')
      .lean()
      .exec();
    
    posts.forEach((post) => {
      post.isLiked = true;
    });

    return posts;
  }

  static count(params) {
    return Post.countDocuments(params);
  }

  static async delete(postId) {
    const post = (await PostsCtrl.getById(postId)).toObject();
    const res = await Post.deleteOne({ _id: postId });
    
    const files = post.files.map((file) => {
      return fs.promises.unlink(__homedir + '/public/uploads/' + file);
    });
    await Promise.all(files);

    await LikesCtrl.delMany({ postId: postId });
    await CommentsCtrl.delMany( { postId: postId } )
    return res;
  }

  static async toggleLike(postId, userId) {    
    const post = await Post.aggregate([
      { "$match": { _id: mongoose.Types.ObjectId(postId) } },
      {
        $project: {
          "likesCount": "$likes",
          "isLiked": {
            $in: [ mongoose.Types.ObjectId(userId), "$likedUsers.userId" ]
          }
        }
      }
    ]);
    
    if (post[0].isLiked) {
      await PostsCtrl.unlike(postId, userId);
      return { liked: false, likesCount: post[0].likesCount - 1 };
    } else {
      await PostsCtrl.like(postId, userId);
      return { liked: true, likesCount: post[0].likesCount + 1 };
    }
  }

  static async unlike(postId, userId) {
    await LikesCtrl.delOne({ postId: postId, userId: userId });

    await Post.updateOne(
      { _id: postId },
      { 
        $pull: { likedUsers: { userId: userId } },
        $inc: { 'likes': -1 }
      }
    );
  }

  static async like(postId, userId) {
    await LikesCtrl.add({
      postId: postId,
      userId: userId
    });

    await Post.updateOne(
      { _id: postId },
      {
        $push: { likedUsers: { userId: userId } },
        $inc: { 'likes': 1 }
      }
    );
  }

  static async addComment(postId, userId, comment) {
    const comm = await CommentsCtrl.add({
      postId: postId,
      userId: userId,
      text: comment
    });

    await Post.updateOne(
      { _id: postId },
      {
        $inc: { 'comments': 1 }
      }
    );

    return comm;
  }

  static getComments(postId, page) {
    return CommentsCtrl.find({ postId: postId }, page);
  }

  static async delComment(postId, commentId) {
    await CommentsCtrl.del({ _id: commentId });
    
    await Post.updateOne(
      { _id: postId },
      {
        $inc: { 'comments': -1 }
      }
    );
  }
}

module.exports = PostsCtrl;
