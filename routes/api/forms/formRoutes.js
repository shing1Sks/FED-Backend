const express = require('express');
const router = express.Router();
const formController = require('../../../controllers/forms/formController')
const registrationController = require('../../../controllers/registration/registrationController');
const {verifyToken} = require('../../../middleware/verifyToken');
const { checkAccess } = require('../../../middleware/access/checkAccess');

// Add validations
// Define your form routes here

router.get('/getAllForms',formController.getAllForms)

router.use(verifyToken)

router.use('/register', checkAccess('USER'), registrationController.addRegistration)


router.get('/registrationCount', checkAccess('MEMBER'), registrationController.getRegistrationCount)

// Add middleware verifyToken, isAdmin
router.use(checkAccess('ADMIN'))

router.post('/addForm', formController.addForm )
router.delete('/deleteForm/:id', formController.deleteForm)
router.put('/editForm/:id', formController.editForm)

router.post('/addSection', formController.addSection)
router.get('/getSection',formController.getSections)

router.get('/download/:id', registrationController.downloadRegistration)

module.exports = router; 
