const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../utils/ApiError');


//@description     Forgot Password
//@route           POST /api/user/forgetPassword
//@access          Public


const verifyOtp = expressAsyncHandler(async (req, res, next) => {
    /*
    -> forgetPassword db me search for user email 
    -> match the otp 
    -> delete the instance 
    
    */
   
   const userEnteredOTP = req.body.otp;
   const emailOfUser = req.body.email;
   const user = await prisma.forgotPassword.findUnique({
       where: {
           email: emailOfUser
        }
    });
    if (userEnteredOTP == user.otp) {
        await prisma.forgotPassword.delete({
            where: {
                email: emailOfUser
            }
        });
        res.json({message : "OTP is verified"})
    } else {
        res.json({message: "Entered OTP is invalid!!"});
    }});
    
    const changePassword = expressAsyncHandler(async (req, res, next) => {
        /*
            -> take the new password from the user in the req
            -> hash the password using bcrypt 
            -> store the new password in the password field of the userdb
            */
    
           const newPassword = req.body.newPassword;
        const confirmNewPassword = req.body.confirmNewPassword;
        const emailOfUser = req.body.email;
        if(newPassword==confirmNewPassword){
            const existingUser = await prisma.user.findUnique({
                where: { emailOfUser }
            });
            existingUser.password = newPassword;
            res.json({user:existingUser})
        }
        else{
            res.json({message: "Confirmation password does not match the new password !!"})
        }
    })
    
    const forgetPassword = expressAsyncHandler(async (req, res, next) => {
        /*
            whenever user clicks on forget pass 
            -> req comes to this handler
            -> ask for email
                -> if the user exist or not in the userdb
            -> generate an otp 
                -> store the otp and useremail temporarily in the forgetPassword db
                -> send the otp to the user email
                -> user will input otp 
                
            -> send the otp to the email
    
            -> verfiyOtp 
    
            -> change password options 
        */
    
        const emailOfUser = req.body.email;
    
                // Check if the user already exists
                const existingUser = await prisma.user.findUnique({
                    where: { email : emailOfUser }
                });
    
                // let generatedOTP = Math.floor(Math.random()*999999)
                const otpGenerator = require('otp-generator')
                let generatedOTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets:false, specialChars: false });
        
                if (existingUser) {
                    const user = await prisma.forgotPassword.create({
                        data: {
                            email : emailOfUser,
                            otp:generatedOTP
                        }
                    });
                    res.json({user : existingUser,otp:generatedOTP,forgotData : user})

                    // await prisma.forgotPassword.delete({
                    //     where: {
                    //         email: emailOfUser
                    //     }
                    // });
                    // res.send("Deleted")
                }
                else{
                    res.json({message:"User Not found"})
                }
        
    })
module.exports = { forgetPassword }