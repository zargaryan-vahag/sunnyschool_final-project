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

  static async sendSignupMail(email, token) {
    const mail = new Mailer(email, {
      subject: 'Account confirmation',
      html: `Click <a href="http://${process.env.frontendHost}:${process.env.frontendPort}/verify?token=${token}">http://${process.env.frontendHost}:${process.env.frontendPort}/verify?token=${token}</a> to verify your account`,
    });
    await mail.send();
  }

  static async sendChangePassMail(email, token) {
    const mail = new Mailer(email, {
      subject: 'Password reset',
      html: `Click <a href="http://${process.env.frontendHost}:${process.env.frontendPort}/passwordreset/${token}">http://${process.env.frontendHost}:${process.env.frontendPort}/passwordreset/${token}</a> to change your password`,
    });
    await mail.send();
  }
}

module.exports = Mailer;
