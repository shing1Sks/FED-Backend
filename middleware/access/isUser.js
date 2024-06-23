const { ApiError } = require('../../utils/ApiError');
const {USER} = require('../../enum/access')

const isUser = async (req, res, next) => {
    try {
        if (!(req.user.access === USER)) {
            throw new ApiError(403, 'Unauthorized', [], null);
        }
        next();
    } catch (error) {
        next(error); // Pass the error to the error handler middleware
    }
};

module.exports = { isUser };
