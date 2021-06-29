const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const Community = new Schema({
  creatorId: { type: ObjectId, ref: 'UserCommon' },
  posts: { type: [ObjectId], ref: 'Post', select: false },
  postsCount: { type: Number, default: 0 },
  followers: { type: [ObjectId], ref: 'UserCommon', select: false },
  followersCount: { type: Number, default: 0 },
  avatar: { type: String, default: 'default_community_image.png' },
  poster: { type: String, default: null },
  name: { type: String, required: true },
  status: { type: String, default: null },
}, {
  versionKey: false,
  timestamps: true
});

Community.set('collection', 'communities');

module.exports = mongoose.model('Community', Community);
