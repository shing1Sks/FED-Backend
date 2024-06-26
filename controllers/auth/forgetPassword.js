const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const expressAsyncHandler = require("express-async-handler");
const { ApiError } = require("../../utils/error/ApiError");
const { sendMail } = require("../../utils/email/nodeMailer");
const loadTemplate = require("../../utils/email/loadTemplate");
const generateOtp = require("../../utils/email/generateOTP");

// SET OTP validity in minutes
const validity = 0.5;

//@description     Forgot Password
//@route           POST /api/user/forgetPassword
//@access          Public
const forgetPassword = expressAsyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ApiError(400, "Email is required"));
    }

    // If the OTP already exists
    const existingOtp = await prisma.forgotPassword.findFirst({
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
        await prisma.forgotPassword.create({
            data: {
                email: email,
                otp: generatedOTP,
            },
        });

        if (process.env.DEBUG === "true") {
            console.log(`OTP Generated for ${ email } : ${ generatedOTP }`);
        }

        // Send OTP to user
        const templateContent = loadTemplate('forgotPassword', { otp: generatedOTP });
        sendMail(email, "OTP for setting new password", templateContent);

        res.json({ message: `OTP sent successfully to ${email}. Valid for ${validity} mins` });

        // Set auto-delete for the OTP after validity ends
        setTimeout(async () => {
            try {
                await prisma.forgotPassword.delete({
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
