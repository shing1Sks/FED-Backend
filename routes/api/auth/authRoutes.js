const express = require('express');
const router = express.Router();
const { validate } = require('../../../middleware/validationMiddleware');
const { registerValidationRules, loginValidationRules } = require('../../../middleware/validator/authValidator');

const upload = require('../../../middleware/multer')

const { login, register, logout, forgetPassword, changePassword } = require('../../../controllers/auth/authController');

// Define the authentication routes here
router.post('/changePassword', changePassword)
router.post('/forgotPassword', forgetPassword)
router.post('/login', loginValidationRules(), validate, login);
// router.post('/register', registerValidationRules(), validate, upload.single('image'), register);
router.post('/register', upload.single('image'), register);
router.post('logout', logout)

module.exports = router;