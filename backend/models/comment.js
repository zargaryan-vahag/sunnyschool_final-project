const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const Comment = new Schema({
  postId: { type: ObjectId, ref: 'Post' },
  userId: { type: ObjectId, ref: 'UserCommon' },
  text: { type: String }
}, {
  versionKey: false,
  timestamps: true
});

Comment.set('collection', 'comments');

module.exports = mongoose.model('Comment', Comment);
