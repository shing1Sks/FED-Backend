const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/error/ApiError');

// Fetch User by Dynamic Field from req.body
const fetchUser = expressAsyncHandler(async (req, res, next) => {
    try {
        // Check if req.body is empty
        // if (Object.keys(req.body).length === 0) {
        //     return next(new ApiError(400, "Parameters required"));
        // }

        // Directly use req.body as where condition
        const users = await prisma.user.findMany({
            where: req.body,
        });

        if (users.length === 0) {
            return next(new ApiError(404, 'User not found'));
        }

        // Remove sensitive data like password before sending response
        const sanitizedUsers = users.map(user => {
            const { password, ...sanitizedUser } = user;
            return sanitizedUser;
        });

        // Return the most relevant results (here simply returning all matches)
        res.status(200).json({ success: true, data: sanitizedUsers });
    } catch (error) {
        console.error('Error fetching user:', error);
        next(new ApiError(500, 'Error fetching user', error));
    }
});

module.exports = { fetchUser };
