const express = require('express');
const router = express.Router();
const {createUser} = require('../../controllers/userController/userController')
// User Routes
router.use('/create-user',createUser)

module.exports = router; 
