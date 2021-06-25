module.exports = class AppError extends Error {
  constructor(message, httpStatus, errors = []) {
    // const trueProto = new.target.prototype;
    super(message);

    this.httpStatus = httpStatus;
    this.errors = errors;
    // this.__proto__ = trueProto;
  }

  static badRequest(message, errors = []) {
    return new AppError(message, 400, errors);
  }

  static unauthorized() {
    return new AppError('User not authorized', 401);
  }

  static inaccessible(message = 'Access denied') {
    return new AppError(message, 403);
  }

  static notFound(message) {
    return new AppError(message, 404);
  }
};
