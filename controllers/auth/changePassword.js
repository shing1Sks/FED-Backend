const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../utils/ApiError');


//@description     Changing Password
//@route           POST /api/user/changePassword
//@access          Public




const changePassword = expressAsyncHandler(async (req, res, next) => {

    const {newPassword, confirmNewPassword, otp,email} = req.body;

        const existingUser = await prisma.forgotPassword.findUnique({
            where: { email : email }
        });

        if(existingUser){
            if (otp == existingUser.otp) {
                if(newPassword===confirmNewPassword){
                    hashedPassword = await bcrypt.hash(newPassword,10)
                    const user = await prisma.user.update({
                        where: { email : email },
                        data : {password : hashedPassword}
                    });
                    user.password = hashedPassword;
                    res.json({message:"Password has been changed"})
                    console.log(user.password);
                    await prisma.forgotPassword.delete({
                        where: {
                            email: email
                        }
                    })

                }
                else{
                    res.send("Passwords do not match!!")
                }
            }  

            else{
                res.json({message: "Invalid OTP !!"})
            }
        }
        else{
            res.send("Wrong email!!")
        }
        

    });

    module.exports = { changePassword }
