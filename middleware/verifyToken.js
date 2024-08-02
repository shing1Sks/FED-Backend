const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const { ApiError } = require('../utils/error/ApiError');

const verifyToken = async (req, res, next) => {
    console.log("VerifyToken middleware is being called");
    
    // Extract the token from cookies or headers
    console.log(req.cookies);
    console.log(token);
    if(!token){
        console.log("token is null")
        return next(new ApiError(401,"token is required"));
    }

    // Check if token exists and starts with "Bearer "
    if (token && token.startsWith("Bearer ")) {
        // Remove "Bearer " prefix
        token = token.slice(7);
    }

    console.log("Extracted Token:", token);

    if (!token) {
        console.log("Token not provided");
        return next(new ApiError(401, "Unauthorized: Token not provided"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { maxAge: '70h' });

        console.log("Token verified");
        console.log(decoded);

        const user = await prisma.user.findUnique({
            where: { email: decoded.email } 
        });        

        if (!user) {
            console.log("User not found");
            return next(new ApiError(404, "User not found"));
        }

        req.user = user;
        console.log("Token verified Successfully")
        next();

    } catch (err) {
        console.log("Error during token verification:", err);
        if(err.statusCode === 401){
            console.log("Token not found in headers");
            return next(new ApiError(401, "Unauthorized: Resend request with token",err));
        }   
        else if (err.name === 'TokenExpiredError') {
            console.log("Token has expired");
            return next(new ApiError(403, "Unauthorized: Token has expired",err));
        } else if (err.name === 'JsonWebTokenError') {
            console.log("Invalid token");
            return next(new ApiError(401, "Forbidden: Invalid token",err));
        } else {
            console.log("Unexpected error");
            return next(new ApiError(500, "Internal Server Error",err));
        }
    }
};

module.exports = { verifyToken };
