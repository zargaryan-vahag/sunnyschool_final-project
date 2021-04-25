const mongoose = require('mongoose');
const userStatusManager = require('../managers/user-status-manager');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const friendSchema = new Schema({ 
  userId: { type: ObjectId, ref: 'User' },
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
  isverified: { type: Boolean, default: true },
  token: { type: String, select: false },
  avatar: { type: String, default: 'default_avatar.png' },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  friends: { type: [friendSchema], select: false },
  // options: {
  //   birthday: { type: Number, default: 0 },
  //   hometown: { type: Number, default: 0 },
  //   gender: { type: Number, default: 0 }
  // },
  info: {
    birthday: { type: Date, default: null },
    hometown: { type: String, default: null },
    gender: { type: Number, default: 0 }
  }
}, {
  versionKey: false,
  timestamps: true
});

UserSchema.set('collection', 'users');

module.exports = mongoose.model('User', UserSchema);
