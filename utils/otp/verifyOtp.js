const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../error/ApiError');

/**
 * Verify OTP for a given email.
 * @param {string} email The email address to verify OTP against.
 * @param {string} otp The OTP to verify.
 * @oaram { EMAIL_VERIFICATION } OtpPurpose Purose of the OTP
 * @returns {boolean} True if OTP is correct, false otherwise.
 */

const verifyOTP = async (email, otp, purpose, deleteOtp = false) => {
    try {
        const hasOtp = await pirisma.otp.findUnique({
            where: { email: email, otp : otp, purpose : purpose}
        });
        if (!hasOtp) {
            return false; // OTP mismatch or not found
        }
        if(deleteOtp){
            try {
                await prisma.otp.delete({
                    where : {
                        id : hasOtp.id
                    }
                })
            } catch (error) {
                throw new ApiError(500, "Error deleting the OTP from the database")
            }
        }
        return true; // OTP verified successfully
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new ApiError(500, 'Error verifying OTP', error);
    }
};

module.exports = verifyOTP;
