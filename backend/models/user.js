const mongoose = require('mongoose');
const userStatusManager = require('../managers/user-status-manager.js');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const friendSchema = new Schema({ 
  userId: { type: ObjectId, ref: 'User', unique: true },
  createdAt: { type: Date, default: Date.now }
}, { 
  versionKey: false,
  timestamps: true
});

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, select: false },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  status: { type: Number, default: userStatusManager.default },
  isverified: { type: Boolean, default: false },
  token: { type: String, select: false },
  avatar: { type: String, default: 'default_avatar.png' },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  birthday: { type: Date, default: null },
  showBirthday: { type: Number, default: 0 },
  hometown: { type: String, default: '' },
  gender: { type: Number, default: 0 },
  friends: { type: [friendSchema], select: false }
}, {
  versionKey: false,
  timestamps: true
});

UserSchema.set('collection', 'users');

module.exports = mongoose.model('User', UserSchema);
