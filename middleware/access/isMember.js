const { ApiError } = require('../../utils/ApiError');
const {MEMBER} = require('../../enum/access')

const isMember = async (req, res, next) => {
    try {
        if (!(req.user.access === MEMBER)) {
            throw new ApiError(403, 'Unauthorized', [], null);
        }
        next();
    } catch (error) {
        next(error); // Pass the error to the error handler middleware
    }
};

module.exports = { isMember };
