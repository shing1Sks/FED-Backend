const { PrismaClient, OtpPurpose, AccessTypes } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../utils/error/ApiError');
const createOrUpdateUser = require('../../utils/user/createOrUpdateUser');
const verifyOTP = require('../../utils/otp/verifyOtp');

//@description     Register a User
//@route           POST /api/auth/register
//@access          Public
const register = expressAsyncHandler(async (req, res, next) => {

    const { member, otp, ...data } = req.body;
    const { email, password, name } = data;

    // Validate request body
    if (!email || !password || !name || !otp) {
        return next(new ApiError(400, "Missing required fields: email, password, name, otp"));
    }

    try {
        // Check if the user is already registered 
        const existingUser = await prisma.user.findUnique({
            where : {
                email : email
            },
            select : {
                id : true
            }
        })

        if(existingUser){
            console.log("User already existing with this email", existingUser);
            return next(new ApiError(400,"User already registerd with this email!!"))
        }
        // Verify OTP -> Assuming that unique user constraint is handled in verifyEmailController
        const isValidOTP = await verifyOTP(email, otp, OtpPurpose.EMAIL_VERIFICATION);

        
        // Log the otp verification if on DEBUG mode
        if (process.env.DEBUG === "true") {
            console.log(isValidOTP);;
        }

        // Check if the OTP is valid
        if (!isValidOTP) {
            return next(new ApiError(400, "Invalid OTP"));
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create or update the unique user
        const newUser = await createOrUpdateUser({ email: email }, data, { password: hashedPassword, access: AccessTypes.USER });

        // Generate the JWT Token
        const token = jwt.sign({ id: newUser.id, email, loginTime: new Date().toISOString() }, process.env.JWT_SECRET, { expiresIn: '7h' });

        // Send the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true
        });

        // Respond to the client immediately
        res.status(201).json({ message: 'User created successfully' });

        // Log the registration success if in debug mode
        if (process.env.DEBUG === "true") {
            console.log(`${email} has registered successfully`);
        }

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
        console.error('Error in registering user:', error);
        return next(new ApiError(500, 'Error in registering user', error));
    }
});

module.exports = { register };
