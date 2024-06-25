const { ApiError } = require('../../utils/ApiError');
const { USER } = require('../../enum/access')

const isMember = async (req, res, next) => {
    try {1
        if (req.user.access === USER) {
            throw new ApiError(403, 'Unauthorized', [], null);
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { isMember };
