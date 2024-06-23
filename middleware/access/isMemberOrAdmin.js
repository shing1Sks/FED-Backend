const { ApiError } = require('../../utils/ApiError');
const {MEMBER, ADMIN} = require('../../enum/access')

const isMemberOrAdmin = async (req, res, next) => {
    try {
        if (!(req.user.access === MEMBER || req.user.access === ADMIN)) {
            throw new ApiError(403, 'Unauthorized', [], null);
        }
        next();
    } catch (error) {
        next(error); // Pass the error to the error handler middleware
    }
};

module.exports = { isMemberOrAdmin };
