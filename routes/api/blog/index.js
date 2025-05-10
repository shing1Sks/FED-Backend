const express = require("express");
const { createBlog } = require("../../../controllers/blog");
const router = express.Router();
const { deleteBlog } = require("../../../controllers/blog/deleteBlog");
const { getBlog } = require("../../../controllers/blog/getBlogs");
// Import the middlewares required
const { checkAccess } = require("../../../middleware/access/checkAccess");
const { verifyToken } = require("../../../middleware/verifyToken");
const { imageUpload } = require("../../../middleware/upload");
const {
  getBlogByAuthor,
  getBlogByVisibility,
  getBlogByDepartment,
  getBlogByCategory,
} = require("../../../controllers/blog/getBlog");
const { updateBlog } = require("../../../controllers/blog/updateBlog");
// Define the blog routes here

// rudrika
router.get("/getBlog", getBlog);
// router.get("/getBlog/:id", getBlog);
router.delete("/deleteBlog/:id", deleteBlog);
router.put("/updateBlog/:id", updateBlog);

// shreyash
router.get("/getBlogByAuthor/:author", getBlogByAuthor);
router.get("/getBlogByVisibility/:visibility", getBlogByVisibility);
router.get("/getBlogByCategory/:category", getBlogByCategory);
router.get("/getBlogByDepartment/:department", getBlogByDepartment);
// router.get('/getBlogByApproval/:approval', getBlogByApproval);

// router.use(verifyToken, checkAccess('ADMIN'));
router.post("/createBlog", imageUpload.single("image"), createBlog);
module.exports = router;
