const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
  birthday: { type: Number, default: 1 },
  hometown: { type: Number, default: 1 },
  gender: { type: Number, default: 1 }
}, { _id: false });
