const mailTransporter = require('../../config/nodeMailer');

function sendMail(to, subject, htmlContent, textContent) {
    return new Promise((resolve) => {
        let mailDetails = {
            from: process.env.MAIL_USER || "i.m.saurav003@gmail.com",
            to: to,
            subject: subject,
            html: htmlContent,
            text: textContent || htmlContent.replace(/<[^>]+>/g, '')
        };

        mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
                console.error('Error sending email:', err);
                resolve({ success: false, error: err.message }); // Resolve with error info instead of rejecting
            } else {
                console.log('Email sent successfully:', data);
                resolve({ success: true, data });
            }
        });
    });
}

module.exports = { sendMail };
