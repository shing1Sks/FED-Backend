const { register } = require('./registerController');
const { login } = require('./loginController');
const { logout } = require('./logoutController');

module.exports = {
    register,
    login,
    logout
};
