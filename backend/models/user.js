const mongoose = require('mongoose');
const userStatusManager = require('../managers/user-status-manager');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const friendSchema = require('./submodels/friend');
const optionsSchema = require('./submodels/options');
const infoSchema = require('./submodels/info');

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: Number, default: userStatusManager.default },
  isverified: { type: Boolean, default: false },
  token: { type: String },
  avatar: { type: String, default: 'default_avatar.png' },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  friends: { type: [friendSchema], select: false },
  communities: { type: [ObjectId], ref: 'Community', select: false },
  followingCommunities: { type: [ObjectId], ref: 'Community', select: false },
  followingCommunitiesCount: { type: Number, default: 0 },
  options: { type: optionsSchema, default: () => ({}) },
  info: { type: infoSchema, default: () => ({}) }
}, {
  versionKey: false,
  timestamps: true
});

UserSchema.set('collection', 'users');

module.exports = mongoose.model('User', UserSchema);
