const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
    console.log("VerifyToken middleware is being called");
    
    const token = req.headers.authorization;

    console.log("imported secret : " + JWT_SECRET);
    console.log("received token : " + token);

    if (!token) {
        console.log("Token not provided");
        return res.status(401).send({ status: "ERROR", message: "Unauthorized: Token not provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { maxAge: '70h' });

        console.log("Token verified");
        console.log(decoded);
        // write the logic here to find the user and add the access level of the user

        const userAccess = await prisma.User.findUnique({
            where: { email: email },
            select: {
                access: true,
            },
        });


        console.log("User Access:", userAccess);

        

        if (!userAccess) {
            console.log("User or Society not found");
            return res.status(404).send({ status: "ERROR", message: "User or Society not found" });
        }

        decoded.access = userAccess.access;
        req.user = decoded;
        next();

    } catch (err) {
        console.log("Error during token verification:", err);
        if (err.name === 'TokenExpiredError') {
            console.log("Token has expired");
            return res.status(401).send({ status: "ERROR", message: "Unauthorized: Token has expired" });
        } else {
            console.log("Invalid token");
            return res.status(403).send({ status: "ERROR", message: "Forbidden: Invalid token" });
        }
    }
};

module.exports = { verifyToken };
