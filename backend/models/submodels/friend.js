const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

module.exports = new Schema({ 
  userId: { type: ObjectId, ref: 'UserCommon' },
  createdAt: { type: Date, default: Date.now }
}, { 
  versionKey: false,
  timestamps: true
});
