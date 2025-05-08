const express = require("express");
const { createBlog } = require("../../../controllers/blog");
const router = express.Router();

// Import the middlewares required
const { checkAccess } = require("../../../middleware/access/checkAccess");
const { verifyToken } = require("../../../middleware/verifyToken");
const { imageUpload } = require("../../../middleware/upload");
const {
  getBlogByAuthor,
  getBlogByVisibility,
  //   getBlogByCategory,
  getBlogByDepartment,
} = require("../../../controllers/blog/getBlog");

// Define the blog routes here

// rudrika
// router.get('/getBlog', getBlog);
// router.get('/getBlog/:id', getBlogById);
// router.delete('/deleteBlog/:id', deleteBlog);
// router.put('/updateBlog/:id', updateBlog);

// shreyash
router.get("/getBlogByAuthor/:author", getBlogByAuthor);
router.get("/getBlogByVisibility/:visibility", getBlogByVisibility);
//currently category not supported in the schema
// router.get("/getBlogByCategory/:category", getBlogByCategory);
router.get("/getBlogByDepartment/:department", getBlogByDepartment);

// router.use(verifyToken, checkAccess('ADMIN'));
router.post("/createBlog", imageUpload.single("image"), createBlog);

module.exports = router;
