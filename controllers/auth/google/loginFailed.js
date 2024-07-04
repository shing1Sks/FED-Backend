const ApiError = require('../../../utils/error/ApiError')
const loginFailed = (req, res, next) => {
    next(new ApiError(401,"Log in falied"))
}
module.exports = {loginFailed};