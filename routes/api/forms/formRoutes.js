const express = require('express');
const router = express.Router();
const formController = require('../../../controllers/forms/formController')
const registrationController = require('../../../controllers/registration/registrationController');
const {verifyToken} = require('../../../middleware/verifyToken');
const { isAdmin, isMemberOrAdmin, isUserOrAdmin } = require('../../../middleware/access/userAccess');

// Add validations
// Define your form routes here

router.get('/getAllForms',formController.getAllForms)

router.use(verifyToken)

router.use('/register', isUserOrAdmin, registrationController.addRegistration)


router.get('/registrationCount', isMemberOrAdmin, registrationController.getRegistrationCount)

// Add middleware verifyToken, isAdmin
router.use(isAdmin)

router.post('/addForm', formController.addForm )
router.delete('/deleteForm/:id', formController.deleteForm)
router.put('/editForm/:id', formController.editForm)

router.post('/addSection', formController.addSection)
router.get('/getSection',formController.getSections)

router.get('/download/:id', registrationController.downloadRegistration)

module.exports = router; 
