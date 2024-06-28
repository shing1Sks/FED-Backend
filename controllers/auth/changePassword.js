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


        console.log("passing step 3");


        if (!isValidOTP) {
            console.log("invalid otp");
            return next(new ApiError(400,"Invalid OTP"))
        }

        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const override = { password : hashedPassword };
        console.log("wrking ")
        const user = await createOrUpdateUser({email : email},{email : email}, override)
        console.log("step 4");
        if(!user){
           return next( new ApiError(400, "error creating user"))
        }
        res.json({ message: "Password has been changed successfully !!" });
        console.log("Password changed successfully");

        // Delete the OTP in the background using a Promise
        new Promise((resolve, reject) => {
            prisma.otp.delete({
                where: {id : isValidOTP.id }
            }).then(() => {
                resolve();
            }).catch(error => {
                console.error('Error deleting OTP:', error);
                reject(error);
            });
        });

    } catch (error) {
        next(new ApiError(500, "Error while changing password", error));
    }
});

module.exports = { changePassword };
