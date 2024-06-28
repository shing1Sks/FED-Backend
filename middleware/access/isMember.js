const { ApiError } = require('../../utils/error/ApiError');
const { PrismaClient, AccessTypes } = require("@prisma/client");
const prisma = new PrismaClient();

const isMember = async (req, res, next) => {
    console.log("Entering isMember middleware");
    try {
        if (req.user) {
            console.log("Verifying through req.user");
            if (req.user.access === AccessTypes.USER) {
                throw new ApiError(403, 'Unauthorized', [], null);
            }
        } else {
            console.log("Verifying through req.body");
            if (!req.body.email) {
                throw new ApiError(400, "Email is required");
            }
            const user = await prisma.user.findUnique({
                where: {
                    email: req.body.email
                }
            });
            if (!user || user.access === AccessTypes.USER) {
                throw new ApiError(404, "User not found or unauthorized");
            }
            req.user = user;
        }
        next();
    } catch (error) {
        console.log("Could not pass isMember middleware");
        next(error);
    }
};

module.exports = { isMember };
