const nodemailer = require('nodemailer');

class Mailer {
  constructor(to, options) {
    this.transporter = nodemailer.createTransport({
      service: 'mail.ru',
      auth: {
        user: process.env.fromMail,
        pass: process.env.fromPass
      }
    });
    
    this.mailOptions = {
      from: process.env.fromMail,
      to,
      ...options
    };
  }

  send() {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(this.mailOptions, (err, info) => {
        if (err) reject(err);
        resolve(info);
      });
    });
  }
}

module.exports = Mailer;
