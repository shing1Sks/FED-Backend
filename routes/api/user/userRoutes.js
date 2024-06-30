const express = require('express');
const router = express.Router();
const { addMember, fetchUser, fetchTeam, deleteMember, deleteUser, editProfile, fetchAccessTypes } = require('../../../controllers/userController/userController');
const { verifyToken } = require('../../../middleware/verifyToken');
const { isMember, isUser, isAdmin } = require('../../../middleware/access/userAccess');
const upload = require('../../../middleware/upload');
const { uploadImage } = require('../../../controllers/image/uploadImage');

// Add validation, token verification, and isMemberOrAdmin

// User Routes
router.get('/team',fetchTeam)
// router.post('/uploadImage', upload.single('image'),uploadImage) 

router.use(verifyToken)
router.put('/editDetails', isMember, editProfile)


router.use(isAdmin)
router.get("/fetchAccessTypes", fetchAccessTypes)
router.post("/addMember", addMember)
router.get("/getUser", fetchUser)
router.delete("/deleteMember", deleteMember)
router.delete("/deleteUser",deleteUser)

module.exports = router; 
