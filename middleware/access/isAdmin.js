const { ApiError } = require('../../utils/error/ApiError');
const { PrismaClient, AccessTypes} = require("@prisma/client");
const prisma = new PrismaClient();

const isAdmin = async (req, res, next) => {
    console.log("Entering isAdmin middleware");
    try {
        if(req.user){
            console.log("Verifying through req.user")
            if (!(req.user.access === AccessTypes.ADMIN)) {
                throw new ApiError(403, 'Unauthorized', [], null);
            }
        }
        else{
            console.log("Verifying through req.body")
            if(!req.body.email){
                throw new ApiError(400, "Email is required")
            }
            const user = await prisma.user.findUnique({
                where : {
                    email : req.body.email,
                    access : AccessTypes.ADMIN
                }
            })
            if(!user){
                throw new ApiError(404,"User not found!")
            }
            req.user = user;
        }
        next();
    } catch (error) {
        console.log("Couldnot pass isAdmin middleware");
        next(error); // Pass the error to the error handler middleware
    }
};

module.exports = { isAdmin };
