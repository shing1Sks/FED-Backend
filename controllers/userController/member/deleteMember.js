const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/ApiError');
const { USER } = require('../../../enum/access')

//@description     Delete Member Field
//@route           DELETE /api/user/deleteMember
//@access          Admin
const deleteMember = expressAsyncHandler(async (req, res, next) => {
    try {

        // Update the user to set the member field to null
        const updatedUser = await prisma.user.update({
            where: { email: req.body.email },
            data: {
                access : USER,
                member: null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                access: true,
                year: true,
                rollNumber: true,
                school: true,
                college: true,
                contactNo: true,
                whatsappNo: true,
                member: true,
                forms: true,
                password: false
            }
        });
        if (!updatedUser) {
            return next(new ApiError(404, 'User not found'));
        }

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('Error deleting member field:', error);
        next(new ApiError(500, 'Error deleting member field', error));
    }
});

module.exports = { deleteMember };
