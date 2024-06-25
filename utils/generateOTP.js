const otpGenerator = () => {
    const otpGenerator = require("otp-generator");
    let generatedOTP = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    return generatedOTP;
  };

  module.exports = otpGenerator;