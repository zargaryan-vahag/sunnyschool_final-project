const jwt = require('jsonwebtoken');

class TokenManager {
  static encode(data) {
    return jwt.sign(data, process.env.privateKey, {
      expiresIn: 60 * 60 * 24
    });
  }

  static async decode(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.privateKey, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      });
    });
  }
}

module.exports = TokenManager;
