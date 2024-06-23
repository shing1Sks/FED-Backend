const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/ApiError');

//@description     Update User Details
//@route           PUT /api/user/update
//@access          Members
const updateUser = expressAsyncHandler(async (req, res, next) => {
    // Destructure fields from req.body except email, password, and member
    const { email, password, member, ...rest } = req.body;

    try {
        // Fetch the current user data
        const currentUser = { ...req.user };

        if (!currentUser) {
            return next(new ApiError(404, 'User not found'));
        }

        // Destructure member object or default to empty object
        const { github, linkedin, img } = member || {};

        // Prepare updated member object
        const updatedMember = currentUser.member ? {
            ...currentUser.member,
            ...(github && { github }),
            ...(linkedin && { linkedin }),
            ...(img && { img }),
        } : (member ? { department: member.department, role: member.role, github, linkedin, img } : {});

        // Update the user details
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...rest,  // Update all fields except email, password, and member
                member: updatedMember,
                access : req.user.access
            },
        });

        // Remove sensitive information from updatedUser
        delete updatedUser.password;

        console.log("Updated user:", updatedUser);

        res.status(200).json({ message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);

        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return next(new ApiError(400, 'Invalid request format', error));
        }

        // Handle other errors
        next(new ApiError(500, 'Error updating user', error));
    }
});

module.exports = { updateUser };
