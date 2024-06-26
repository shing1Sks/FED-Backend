const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../utils/error/ApiError');

//@description     Changing Password
//@route           POST /api/user/changePassword
//@access          Public
const changePassword = expressAsyncHandler(async (req, res, next) => {
    try {
        const { newPassword, confirmPassword, otp, email } = req.body;

        const existingUser = await prisma.forgotPassword.findUnique({
            where: { email: email }
        });

        if (!existingUser) {
            return res.status(400).json({ message: "Wrong email!!" });
        }

        if (otp !== existingUser.otp) {
            return res.status(400).json({ message: "Invalid OTP !!" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match!!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await prisma.user.update({
            where: { email: email },
            data: { password: hashedPassword }
        });
        res.json({ message: "Password has been changed successfully !!" });
        console.log("Password changed successfully")
        await prisma.forgotPassword.delete({
            where: { email: email }
        });
    } catch (error) {
        next(new ApiError(500, "Error while changing password", error));
    }
});

module.exports = { changePassword };
