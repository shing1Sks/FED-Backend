const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../utils/ApiError');

//@description     Login a User
//@route           POST /api/auth/login
//@access          Registered User
const login = expressAsyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.User.findUnique({
            where: { email },
            select: { id: true, access: true, password: true }
        });

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return next(new ApiError(401, 'Invalid password'));
        }

        // Generate the JWT Token
        const token = jwt.sign({ email, access: user.access, id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour in milliseconds
        });

        res.json({ status: "OK", message: "LOGGED IN" });
    } catch (error) {
        next(error);
    }
});

module.exports = { login };
