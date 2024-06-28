const express = require('express');
const router = express.Router();
const { validate } = require('../../../middleware/validationMiddleware');
const { registerValidationRules, loginValidationRules } = require('../../../middleware/validator/authValidator');

// Import the auth controllers required
const { login, verifyEmail, register, forgetPassword, changePassword, logout } = require('../../../controllers/auth/authController');

// Import the middlewares required
const { isUser } = require('../../../middleware/access/userAccess');

// Define the authentication routes here

// Routes to login for existing user
router.post('/login', loginValidationRules(), validate, isUser, login);

// Routes to register a new user
router.post('/verifyEmail', verifyEmail)
router.post('/register', registerValidationRules(),validate, register);

// Routes to change password of existing user
router.post('/forgotPassword',isUser, forgetPassword)
router.post('/changePassword',isUser, changePassword)


// router.post('/register', registerValidationRules(), validate, upload.single('image'), register);

// not to be used 
router.post('logout', logout)

module.exports = router;