const { PrismaClient, AccessTypes } = require('@prisma/client');
const prisma = new PrismaClient();
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/error/ApiError');
const { USER } = require('../../../enum/access');
const createOrUpdateUser = require('../../../utils/user/createOrUpdateUser');

//@description     Delete Member Field
//@route           DELETE /api/user/deleteMember
//@access          Admin
const deleteMember = expressAsyncHandler(async (req, res, next) => {
    try {

        // Update the user to set the member field to null
        const updatedUser = await createOrUpdateUser({email : req.body.email},{},{ access : AccessTypes.USER })
        if (!updatedUser) {
            return next(new ApiError(404, 'User not found'));
        }

        // Delete the password before sending the data
        delete updatedUser.password;

        res.status(200).json({ success: true, message : "Member changed to user type" ,data: updatedUser });
    } catch (error) {
        console.error('Error deleting member field:', error);
        next(new ApiError(500, 'Error deleting member field', error));
    }
});

module.exports = { deleteMember };
