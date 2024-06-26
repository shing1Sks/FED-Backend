const { ApiError } = require('../../utils/error/ApiError');
const { PrismaClient, $Enums, AccessTypes} = require("@prisma/client");
const {USER} = require('../../enum/access')

const isUser = async (req, res, next) => {

    console.log($Enums)
    try {
        if (!(req.user.access === AccessTypes.USER)) {
            throw new ApiError(403, 'Unauthorized', [], null);
        }
        next();
    } catch (error) {
        next(error); // Pass the error to the error handler middleware
    }
};

module.exports = { isUser };
