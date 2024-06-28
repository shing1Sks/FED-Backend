const express = require('express');
const router = express.Router();
const { updateUser, addMember, fetchUser, fetchTeam, deleteMember, deleteUser } = require('../../../controllers/userController/userController');
const { verifyToken } = require('../../../middleware/verifyToken');
const { isMember, isUser, isAdmin } = require('../../../middleware/access/userAccess');
const upload = require('../../../middleware/multer');
const { uploadImage } = require('../../../controllers/image/uploadImage');

// Add validation, token verification, and isMemberOrAdmin

// User Routes
router.get('/team',fetchTeam)
// router.post('/uploadImage', upload.single('image'),uploadImage) 

router.use(verifyToken)
router.put('/editDetails', isMember, updateUser)


router.use(isAdmin)
router.post("/addMember", addMember)
router.get("/:email", fetchUser)
router.delete("/deleteMember", deleteMember)
router.delete("/deleteUser",deleteUser)

module.exports = router; 
