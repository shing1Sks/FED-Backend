const mailTransporter = require("../../config/nodeMailer");

function sendMail(to, subject, htmlContent, textContent, attachments = []) {
  return new Promise((resolve, reject) => {
    let mailDetails = {
      from: process.env.MAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]+>/g, ""),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    mailTransporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        console.error("Error sending email:", err);
        reject({ success: false, error: err.message });
      } else {
        console.log("Email sent successfully:", data);
        resolve({ success: true, data });
      }
    });
  });
}

module.exports = { sendMail };
