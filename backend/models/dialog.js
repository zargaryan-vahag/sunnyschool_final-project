const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const MessageSchema = new Schema({ 
  userId: { type: ObjectId, ref: 'User' },
  text: { type: String },
  createdAt: { type: Date, default: Date.now }
}, {
  versionKey: false,
  timestamps: true 
});

const Dialog = new Schema({
  user1: { type: ObjectId, ref: 'User' },
  user2: { type: ObjectId, ref: 'User' },
  read: { type: ObjectId, ref: 'User' },
  messages: { type: [MessageSchema], select: false }
}, {
  versionKey: false,
  timestamps: true
});

Dialog.set('collection', 'dialogs');

module.exports = mongoose.model('Dialog', Dialog);
