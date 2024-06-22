const express = require('express');
const router = express.Router();
const {addEvent} = require('../../controllers/events/eventController')
// User Routes
router.use('/addEvent',addEvent)

module.exports = router; 
