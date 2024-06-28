const { ApiError } = require('../../utils/error/ApiError');
const { PrismaClient, AccessTypes } = require("@prisma/client");
const prisma = new PrismaClient();


const getAllowedAccessTypes = () => {
    const accessTypes = Object.values(AccessTypes);
    return accessTypes.filter(value => typeof value === 'string');
};

const isUserOrMember = async (req, res, next) => {
    try {
        const allowedAccessTypes = getAllowedAccessTypes();

        if (req.user) {
            console.log("Verifying through req.user");
            if (!allowedAccessTypes.includes(req.user.access)) {
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
            if (!user || !allowedAccessTypes.includes(user.access)) {
                throw new ApiError(404, "User not found or unauthorized");
            }
            req.user = user;
        }
        next();
    } catch (error) {
        console.log("Could not pass isUserOrMember middleware");
        next(error);
    }
};

module.exports = { isUserOrMember };
