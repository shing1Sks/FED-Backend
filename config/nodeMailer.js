// config for nodeMailer
const nodemailer = require('nodemailer');

const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// module.exports = mailTransporter;



//config for nodeMailer
// const nodemailer = require('nodemailer');

// const mailTransporter = nodemailer.createTransport({
//   host: 'smtp-relay.brevo.com', // Brevo SMTP server
//   port: 587, // TLS Port
//   secure: false, // Use false for TLS
//   auth: {
//     user: process.env.MAIL_USER, // Your Brevo SMTP login (e.g., 884f42001@smtp-brevo.com)
//     pass: process.env.MAIL_PASS  // Your Brevo SMTP password
//   }
// });

module.exports = mailTransporter;
