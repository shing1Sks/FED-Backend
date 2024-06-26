const { PrismaClient, OtpPurpose, AccessTypes } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../utils/error/ApiError');
const createOrUpdateUser = require('../../utils/user/createOrUpdateUser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const path = require('path');
const verifyOTP = require('../../utils/otp/verifyOtp');

//@description     Register a User
//@route           POST /api/auth/register
//@access          Public
const register = expressAsyncHandler(async (req, res, next) => {

    const { member, ...data } = req.body;
    const { email, password, name, otp } = data;

    // Validate request body
    if (!email || !password || !name || !otp) {
        return next(new ApiError(400, "Missing required fields: email, password, name, otp"));
    }

    try {

        //verify OTP -> Assuming that unique user constaint is handeleted in verifyEmailController
        const isValidOTP = await verifyOTP( email, otp, OtpPurpose.EMAIL_VERIFICATION)

        // Check if the OTP is valid
        if (!isValidOTP) {
            return next(new ApiError(400, "Invalid OTP"))
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the unique user
        const newUser = await createOrUpdateUser({email : email}, data, { password: hashedPassword, access: AccessTypes.USER });

        // Generate the JWT Token
        const token = jwt.sign({ id: newUser.id, email, loginTime: new Date().toISOString() }, process.env.JWT_SECRET, { expiresIn: '7h' });

        // Send the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true
        });

        // Respond to the client immediately
        res.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        console.error('Error in registering user:', error);
        return next(new ApiError(500, 'Error in registering user', error));
    }
});

module.exports = { register };
