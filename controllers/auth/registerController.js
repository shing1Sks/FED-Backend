const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../utils/ApiError');
const { USER } = require('../../enum/access');
const createUser = require('../../utils/createUser');

//@description     Register a User
//@route           POST /api/auth/register
//@access          Public
const register = expressAsyncHandler(async (req, res, next) => {
    const { email, password, name, school, rollNumber, year, college, contactNo, whatsappNo } = req.body;

    // Validate request body
    if (!email || !password || !name) {
        return next(new ApiError(400, "Missing required fields: email, password, name"));
    }

    try {
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return next(new ApiError(400, "User already exists with this email"));
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // const createUser = await createUser(access, hashedPassword, req.body)

        // Create the new user
        // const user = await prisma.user.create({
        //     data: {
        //         email,
        //         password: hashedPassword,
        //         name,
        //         year,
        //         rollNumber,
        //         school,
        //         college,
        //         contactNo,
        //         whatsappNo
        //     }
        // });
        // const user = await prisma.user.create({
        //     data: {
        //         ...req.body,
        //         password:hashedPassword,
        //         access : USER
        //     }
        // });

        const override = {
            password: hashedPassword,
            access: USER
        }

        const user = createUser(req.body, override);

        // Generate the JWT Token
        const token = jwt.sign({ email, id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            // secure: process.env.NODE_ENV === 'production',
            // sameSite: 'strict',
            // maxAge: 3600000 // 1 hour in milliseconds
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error in registering user:', error);
        next(new ApiError(500, 'Error in registering user', error)); // Send error with ApiError
    }
});

module.exports = { register };
