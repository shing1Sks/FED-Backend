const express = require('express');
const router = express.Router();
const { addMember, fetchUser, fetchTeam, deleteMember, deleteUser, editProfile, fetchAccessTypes } = require('../../../controllers/userController/userController');
const { verifyToken } = require('../../../middleware/verifyToken');
const { checkAccess } = require('../../../middleware/access/checkAccess');
const upload = require('../../../middleware/upload');
const { uploadImage } = require('../../../controllers/image/uploadImage');

// Add validation, token verification, and isMemberOrAdmin
router.get("/fetchAccessTypes", fetchAccessTypes)
// User Routes
router.get('/fetchTeam',fetchTeam)
// router.post('/uploadImage', upload.single('image'),uploadImage) 

router.use(verifyToken)
router.put('/editDetails', checkAccess('MEMBER'), editProfile)


router.use(checkAccess('ADMIN'))
router.post("/addMember", addMember)
router.get("/getUser", fetchUser)
router.delete("/deleteMember", deleteMember)
router.delete("/deleteUser",deleteUser)

module.exports = router; 
