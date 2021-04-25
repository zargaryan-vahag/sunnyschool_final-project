const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const FRequest = new Schema({
  from: { type: ObjectId, ref: 'User' },
  to: { type: ObjectId, ref: 'User' },
}, {
  versionKey: false,
  timestamps: true
});

FRequest.set('collection', 'friendRequests');

module.exports = mongoose.model('FRequest', FRequest);
