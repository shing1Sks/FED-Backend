const express = require('express');
const router = express.Router();
const { editDetails } = require('../../controllers/userController/userController')

// Add validation, token verification, and isMember
// User Routes
router.use('/editDetails',editDetails)

module.exports = router; 
