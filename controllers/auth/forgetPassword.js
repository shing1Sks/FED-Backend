const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../utils/ApiError');

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
})

const chngePassword = expressAsyncHandler(async (req, res, next) => {
    /*
        -> take the new password from the user in the req
        -> hash the password using bcrypt 
        -> store the new password in the password field of the userdb
    */
})

const verifyOtp = expressAsyncHandler(async (req, res, next) => {
    /*
        -> forgetPassword db me search for user email 
        -> match the otp 
        -> delete the instance 

    */
})

module.exports = { forgetPassword }