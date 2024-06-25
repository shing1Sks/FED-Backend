//config for nodeMailer
const nodemailer = require('nodemailer');

const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'amaldeeppatra21@gmail.com',
        pass: 'wblmwknwabjgxtpb'
    }
});

module.exports = mailTransporter;