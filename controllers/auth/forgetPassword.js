const { PrismaClient, OtpPurpose } = require("@prisma/client");
const prisma = new PrismaClient();
const expressAsyncHandler = require("express-async-handler");
const { ApiError } = require("../../utils/error/ApiError");
const generateOtp = require("../../utils/otp/generateOTP");
const sendOtpToMail = require("../../utils/email/generateOtpAndSendMail");

// SET OTP validity in minutes
const validity = 15;

//@description     Forgot Password
//@route           POST /api/user/forgetPassword
//@access          Public
const forgetPassword = expressAsyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ApiError(400, "Email is required"));
    }

    // If the OTP already exists
    const existingOtp = await pirisma.otp.findFirst({
        where: { email: email }
    });
    if (existingOtp) {
        return next(new ApiError(400, "Retry after some time!"));
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!existingUser) {
        return next(new ApiError(400, "User does not exist"));
    }

    const generatedOTP = generateOtp();

    try {

        // Send OTP to user
        const placeholders = { validity : validity };
        sendOtpToMail(email, OtpPurpose.FORGOT_PASSWORD ,'forgotPassword',"OTP for setting new password",true, templateContent);

        res.json({ message: `OTP sent successfully to ${email}. Valid for ${validity} mins` });

        // Set auto-delete for the OTP after validity ends
        setTimeout(async () => {
            try {
                await pirisma.otp.delete({
                    where: { email: email },
                });
                if (process.env.DEBUG === "true") {
                    console.log(`OTP Deleted for ${ email } : ${ generatedOTP }`);
                }
            } catch (error) {
                console.error('Error deleting expired OTP:', error);
            }
        }, 60000 * validity);

    } catch (error) {
        console.error('Error in forgot password process:', error);
        next(new ApiError(500, "Error in forgot password process"));
    }
});

module.exports = { forgetPassword };
