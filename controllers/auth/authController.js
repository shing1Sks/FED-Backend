const { register } = require('./registerController');
const { login } = require('./loginController');
const { logout } = require('./logoutController');
const { forgetPassword } = require('./forgetPassword');
const { changePassword } = require('./changePassword')

module.exports = {
    register,
    login,
    logout,
    forgetPassword,
    changePassword
};
