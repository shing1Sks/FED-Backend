const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/error/ApiError');

// Fetch User by Dynamic Field from req.body
const fetchUser = expressAsyncHandler(async (req, res, next) => {
    try {
        console.log("Entering fetch user fnction");
        // Check if req.body is empty
        // if (Object.keys(req.body).length === 0) {
        //     return next(new ApiError(400, "Parameters required"));
        // }

        // Directly use req.body as where condition
        const user = await prisma.user.findUnique({
            where: req.body,
        });

        if (user.length === 0) {
            return next(new ApiError(404, 'User not found'));
        }

        // Remove sensitive data like password before sending response
        delete user.password;

        // Return the most relevant results (here simply returning all matches)
        res.status(200).json({ success: true, user: user });
    } catch (error) {
        console.error('Error fetching user:', error);
        next(new ApiError(500, 'Error fetching user', error));
    }
});

module.exports = { fetchUser };
