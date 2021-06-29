const fs = require('fs');

const Post = require('../models/post');
const Like = require('../models/like');
const Comment = require('../models/comment');
const AppError = require('../managers/app-error');

class PostService {
  static async getById(id) {
    return Post.findById(id).lean();
  }

  static hasAccess(post, userId) {
    return post.author == userId;
  }

  static async isLiked(postId, userId) {
    return Like.exists({ userId, postId });
  }

  static async getNews(userId, page) {
    const posts = await Post.find({})
      .skip((page - 1) * 10)
      .limit(10)
      .sort({ createdAt: -1 })
      .populate('author')
      .populate('community')
      .lean()
      .exec();

    for (const post of posts) {
      post.isLiked = await PostService.isLiked(post._id, userId);
    }

    return posts;
  }

  static async createPost(author, content, community, files = []) {
    let post = new Post({ author, content, community, files });
    post = await post.save();
    return post.toObject();
  }

  static async deletePost(postId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw AppError.notFound('Post not found');
    }

    await Post.deleteOne({ _id: postId });
    await Like.deleteMany({ postId });
    await Comment.deleteMany({ postId });

    const filesArr = post.files.map((file) => {
      return fs.promises.unlink(__homedir + '/public/uploads/' + file);
    });
    await Promise.all(filesArr);
  }

  static async getUserPosts(userId, page) {
    const posts = await Post.find({
      author: userId,
      community: null
    }).skip((page - 1) * 10)
      .limit(10)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    
    for (const post of posts) {
      const isLiked = await Like.exists({
        postId: post._id,
        userId
      });
      post.isLiked = isLiked;
    }

    return posts;
  }

  static async getUserPostsCount(userId) {
    return Post.countDocuments({
      author: userId,
      community: null
    });
  }

  static async getLikedPosts(userId, page) {
    const posts = await Post.find({
      "likedUsers.userId": userId
    }).skip((page - 1) * 10)
      .limit(10)
      .sort({ "likedUsers.createdAt": -1 })
      .populate('author')
      .populate('community')
      .lean()
      .exec();
    
    for (const post of posts) {
      post.isLiked = true;
    }

    return posts;
  }

  static async toggleLike(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw AppError.notFound('Post not found');
    }

    const isLiked = await PostService.isLiked(postId, userId);
    if (isLiked) {
      await Like.deleteOne({ postId, userId });
      await Post.updateOne({ _id: postId }, { 
        $pull: { likedUsers: { userId } },
        $inc: { 'likes': -1 }
      });

      return { liked: false, likesCount: post.likes - 1 };
    } else {
      new Like({ postId, userId }).save();
      await Post.updateOne({ _id: postId }, {
        $push: { likedUsers: { userId } },
        $inc: { 'likes': 1 }
      });

      return { liked: true, likesCount: post.likes + 1 };
    }
  }

  static async createPostComment(postId, userId, text) {
    let comment = await new Comment({ postId, userId, text }).save();
    comment = comment.toObject();

    await Post.updateOne({ _id: postId }, {
      $inc: { 'comments': 1 }
    });

    return comment;
  }

  static async getPostComments(postId, page) {
    return Comment.find({ postId })
      .skip((page - 1) * 10)
      .limit(10)
      .sort({ createdAt: -1 })
      .populate('userId')
      .lean()
      .exec();
  }

  static async deletePostComment(postId, commentId) {
    await Comment.deleteOne({ _id: commentId });
    await Post.updateOne({ _id: postId }, {
      $inc: { 'comments': -1 }
    });
  }
}

module.exports = PostService;
