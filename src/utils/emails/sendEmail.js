const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // from .env file
    pass: process.env.PASSWORD, // from .env file
  },
});

module.exports = (mailOptions) => {
  return transporter.sendMail(mailOptions);
};
