const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const expressAsyncHandler = require("express-async-handler");
const { ApiError } = require("../../utils/ApiError");
const { sendMail } = require("../../utils/nodeMailer");
const otpGenerator = require("../../utils/generateOTP");

//@description     Forgot Password
//@route           POST /api/user/forgetPassword
//@access          Public



const forgetPassword = expressAsyncHandler(async (req, res, next) => {

  const email = req.body.email;

  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!existingUser) {
    return next(new ApiError(400, "User does not exist"));
  }

  const generatedOTP = otpGenerator();

  const user = await prisma.forgotPassword.create({
    data: {
      email: email,
      otp: generatedOTP,
    },
  });
  res.json({ otp: generatedOTP, message: "OTP will not work after 10mins" });

  const autoDelete = async () => {
    await prisma.forgotPassword.delete({
      where: { email: email },
    });
  };

  setTimeout(() => {
    autoDelete();
  }, 600000);

  const text = `<p>${generatedOTP}</p>`;
  sendMail(email, "OTP for setting new password", text);
});
module.exports = { forgetPassword };
