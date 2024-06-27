const { PrismaClient, OtpPurpose } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../utils/error/ApiError');
const verifyOtp = require('../../utils/otp/verifyOtp');
const createOrUpdateUser = require('../../utils/user/createOrUpdateUser');

//@description     Changing Password
//@route           POST /api/user/changePassword
//@access          Public
const changePassword = expressAsyncHandler(async (req, res, next) => {
    try {
        console.log("Entering change password controller");
        
        const { newPassword, confirmPassword, otp, email } = req.body;

        // Apply validators and remove from here
        if(!newPassword || !confirmPassword || !otp || !email){
            next(new ApiError(400, "Missing fields."))
        }
        // Check if both the password matches
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New and confirm Passwords do not match!!" });
        }
        console.log("passing step 1");


        //verify OTP -> Assuming that unique user constaint is handeleted in verifyEmailController
        const isValidOTP = await verifyOtp( email, otp, OtpPurpose.FORGOT_PASSWORD, false)
        console.log("passing step2");

        console.log("is valid otp", isValidOTP);


        if (!isValidOTP) {
            console.log("invalid otp");
            return next(new ApiError(400,"Invalid OTP"))
        }

        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const override = { password : hashedPassword };
        const user = await createOrUpdateUser({email : email},{email : email}, override)
        if(!user){

        }
        res.json({ message: "Password has been changed successfully !!" });
        console.log("Password changed successfully");

    } catch (error) {
        next(new ApiError(500, "Error while changing password, regenerate the OTP", error));
    }
});

module.exports = { changePassword };
