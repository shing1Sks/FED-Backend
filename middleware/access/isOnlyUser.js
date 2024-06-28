const { ApiError } = require('../../utils/error/ApiError');
const { PrismaClient, AccessTypes } = require("@prisma/client");
const prisma = new PrismaClient();

const isOnlyUser = async (req, res, next) => {
    try {
        if (req.user) {
            console.log("req.user exists");
            if (req.user.access !== AccessTypes.USER || req.user.access !== AccessTypes.ADMIN ) {
                throw new ApiError(403, 'Unauthorized', [], null);
            }
        } else {
            if (!req.body.email) {
                throw new ApiError(400, "Email is required");
            }
            const user = await prisma.user.findUnique({
                where: {
                    email: req.body.email
                }
            });
            if (!user || user.access !== AccessTypes.USER || req.user.access !== AccessTypes.ADMIN) {
                throw new ApiError(404, "User not found or unauthorized");
            }
            req.user = user;
        }
        next();
    } catch (error) {
        console.log("Could not pass isUser middleware");
        next(error);
    }
};

module.exports = { isOnlyUser };
