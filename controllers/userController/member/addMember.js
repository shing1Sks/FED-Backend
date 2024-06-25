const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/ApiError');
const { MEMBER } = require('../../../enum/access')

//@description     Update User Details
//@route           PUT /api/user/addMember
//@access          Admin
const addMember = expressAsyncHandler(async (req, res, next) => {
    try {
        // Fetch the current user data
        const currentUser = { ...req.user };

        if (!currentUser) {
            return next(new ApiError(404, 'User not found'));
        }

        // Destructure fields from req.body except email and password
        const { email, password, ...rest } = req.body;

        // Update the user details
        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: {
                ...rest,
                access : req.boby.acess
            },
        });

        delete updatedUser.password; // Delete password from updatedUser object

        console.log("Updated user:", updatedUser);

        res.status(200).json({ message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);

        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return next(new ApiError(400, 'Invalid request format', error));
        }
        next(new ApiError(500, 'Error updating user', error)); // Send error with ApiError
    }
});

module.exports = { addMember };
