const express = require('express');
const router = express.Router();
const { validate } = require('../../../middleware/validationMiddleware');
const { registerValidationRules, loginValidationRules } = require('../../../middleware/validator/authValidator');

const { login, register, logout } = require('../../../controllers/auth/authController');

// Define the authentication routes here
router.post('/login', loginValidationRules(), validate, login);
router.post('/register', registerValidationRules(), validate,  register);
router.post('logout', logout)

module.exports = router;