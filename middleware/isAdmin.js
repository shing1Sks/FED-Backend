const { ApiError } = require('../utils/ApiError');

const isAdmin = async (req, res, next) => {
    try {
        if (!(req.user.access === 0)) {
            throw new ApiError(403, 'Unauthorized', [], null);
        }
        next();
    } catch (error) {
        next(error); // Pass the error to the error handler middleware
    }
};

module.exports = { isAdmin };
