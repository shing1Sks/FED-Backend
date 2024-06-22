const express = require('express');
const router = express.Router();
const formController = require('../../controllers/forms/formController')

// Add validations
// Define your form routes here

router.get('/getAllForms',formController.getAllForms)

// Add middleware verifyToken, isAdmin

router.post('/addForm', formController.addForm )
router.delete('/deleteForm/:id', formController.deleteForm)
router.put('/editForm/:id', formController.editForm)

module.exports = router; 
