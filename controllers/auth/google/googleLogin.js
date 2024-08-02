const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/error/ApiError');

//@description     Login a User
//@route           POST /api/auth/googleLogin
//@access          Registered User
const googleLogin = expressAsyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if(!email){
        return next(new ApiError(400,"Missing fields : email"))
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        // Generate the JWT Token with only id, email, and login time
        const token = jwt.sign({ id: user.id, email: user.email, loginTime: new Date().toISOString() }, process.env.JWT_SECRET, { expiresIn: '7h' });

        // Send the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            // secure: process.env.NODE_ENV === 'production',
            // sameSite: 'strict',
            // maxAge: 3600000 // 1 hour in milliseconds
        });

        //delete the password field before sending the data
        delete user.password

        res.status(200).json({ message: "LOGGED IN", user: user, token: token });
        console.log(`Successfully LOGGEDIN trough google !! -> ${ user.email}`);
    } catch (error) {
        next(error);
    }
});

module.exports = { googleLogin };
