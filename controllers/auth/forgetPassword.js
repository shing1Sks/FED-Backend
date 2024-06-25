const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../utils/ApiError');


//@description     Forgot Password
//@route           POST /api/user/forgetPassword
//@access          Public



const otpGenerator=()=>{
    const otpGenerator = require('otp-generator')
    let generatedOTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets:false, specialChars: false });
    return generatedOTP;
}
    
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

                let generatedOTP = otpGenerator();

        
                if (existingUser) {
                    const user = await prisma.forgotPassword.create({
                        data: {
                            email : emailOfUser,
                            otp:generatedOTP
                        }
                    });
                    res.json({otp:generatedOTP,message : "OTP will not work after 10mins"})

                    const autoDelete = async()=>{
                        await prisma.forgotPassword.delete({
                            where : {email : emailOfUser}
                        })
                    }

                    setTimeout(()=>{
                        autoDelete();
                    },600000);

                }
                else{
                    res.json({message:"User Not found"})
                }
        
    })
module.exports = { forgetPassword }