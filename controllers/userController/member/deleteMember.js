const { PrismaClient, AccessTypes } = require('@prisma/client');
const prisma = new PrismaClient();
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/error/ApiError');
const updateUser = require('../../../utils/user/updateUser');

//@description     Delete Member Field
//@route           DELETE /api/user/deleteMember
//@access          Admin
const deleteMember = expressAsyncHandler(async (req, res, next) => {
    try {
        // Check if email is provided
        const { email } = req.body;
        if (!email) {
            return next(new ApiError(400, 'Email is required'));
        }

        // Check if the user exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!existingUser) {
            return next(new ApiError(404, 'User not found'));
        }

        // Update the user to set the member field to null
        const updatedUser = await updateUser({ email: email }, {}, { access: AccessTypes.USER });

        // Delete the password before sending the data
        delete updatedUser.password;

        res.status(200).json({ success: true, message: "Member changed to user type", data: updatedUser });
    } catch (error) {
        console.error('Error deleting member', error);
        next(new ApiError(500, 'Error deleting member field', error));
    }
});

module.exports = { deleteMember };
