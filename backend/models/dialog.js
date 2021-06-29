const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const MessageSchema = new Schema({ 
  userId: { type: ObjectId, ref: 'UserCommon' },
  text: { type: String },
  createdAt: { type: Date, default: Date.now }
}, {
  versionKey: false,
  timestamps: true 
});

const Dialog = new Schema({
  user1: { type: ObjectId, ref: 'UserCommon' },
  user2: { type: ObjectId, ref: 'UserCommon' },
  read: { type: ObjectId, ref: 'UserCommon' },
  messages: { type: [MessageSchema], select: false }
}, {
  versionKey: false,
  timestamps: true
});

Dialog.set('collection', 'dialogs');

module.exports = mongoose.model('Dialog', Dialog);
