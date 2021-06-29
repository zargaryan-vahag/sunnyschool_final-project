const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = new Schema({
  birthday: { type: Date, default: null },
  hometown: { type: String, default: null },
  gender: { type: Number, default: 0 }
}, { _id: false });
