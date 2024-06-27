const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../error/ApiError');

const verifyOtp = async (email, otp, purpose, deleteOtp = false) => {
    console.log("Entering verify otp");
    try {
        console.log(email,otp,purpose);
        const hasOtp = await prisma.otp.findFirst({
            where: { email: email, otp : otp, for : purpose}
        });

        console.log(hasOtp);

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
        return hasOtp; // OTP verified successfully
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new ApiError(error.statusCode, 'Error verifying OTP', error);
    }
};

module.exports = verifyOtp;
