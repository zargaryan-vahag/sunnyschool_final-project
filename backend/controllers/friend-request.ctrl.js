const FRequest = require('../models/friend-request');

class FRequestCtrl {
  static getById(id) {
    return FRequest.findById(id);
  }

  static add(params) {
    const fr = new FRequest(params);
    return fr.save();
  }

  static delOne(params) {
    return FRequest.deleteOne(params);
  }

  static find(params) {
    return FRequest.find(params).populate('from');
  }

  static findOne(params) {
    return FRequest.findOne(params);
  }

  static count(params) {
    return FRequest.countDocuments(params);
  }
}

module.exports = FRequestCtrl;
