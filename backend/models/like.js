const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const Like = new Schema({
  postId: { type: ObjectId, ref: 'Post' },
  userId: { type: ObjectId, ref: 'User' },
}, {
  versionKey: false,
  timestamps: true
});

Like.set('collection', 'likes');

module.exports = mongoose.model('Like', Like);
