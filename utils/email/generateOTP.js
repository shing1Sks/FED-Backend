const otpGenerator = require("otp-generator");

const generateOtp = () => {
    let generatedOTP = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    return generatedOTP;
  };

  module.exports = generateOtp;