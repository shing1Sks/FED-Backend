// functionality to send mail 
// input -> send email to ? , content -> html , subject 
// dont use await -> promise 
// forget pass otp 
// whenever a new user is created 
// registration successfull

const mailTransporter = require('../../config/nodeMailer');

function sendMail(to, subject, htmlContent) {
    let mailDetails = {
        from: 'amaldeeppatra21@gmail.com',
        to: to,
        subject: subject,
        html: htmlContent
    };

    mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log('Email sent successfully');
        }
    });
}

module.exports = {sendMail}