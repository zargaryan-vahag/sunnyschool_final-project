const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const LikeSchema = new Schema({ 
  userId: { type: ObjectId, ref: 'UserCommon' },
  timestamp: Date
}, {
  versionKey: false,
  timestamps: true 
});

const Post = new Schema({
  author: { type: ObjectId, ref: 'UserCommon' },
  community: { type: ObjectId, ref: 'Community', default: null },
  content: { type: String, default: '' },
  files: [{ type: String }],
  likedUsers: { type: [LikeSchema], select: false },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  edited: { type: Boolean, default: false },
}, {
  versionKey: false,
  timestamps: true
});

Post.set('collection', 'posts');

module.exports = mongoose.model('Post', Post);
