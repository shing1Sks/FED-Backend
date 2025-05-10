// write code to get a blog post
const { ApiError } = require("../../utils/error/ApiError");
const { PrismaClient } = require("@prisma/client");
const status = require("http-status");
const prisma = new PrismaClient();

const getBlog = async (req, res, next) => {
  var blogs = null;

  const { id } = req?.query || null;
  console.log("ID:", id);
  try {
    // Check if the blog ID is provided
    if (id) {
      blogs = await prisma.blog.findUnique({
        where: { id: id },
      });
    } else {
      blogs = await prisma.blog.findMany();
      console.log("Blogs:", blogs);
    }

    // Check if the blog exists
    if (!blogs) {
      return res.status(status.NOT_FOUND).json({ message: "Blog not found" });
    }

    res.status(status.OK).json({
      success: true,
      message: "All blogs fetched successfully",
      blogs: blogs,
    });
  } catch (error) {
    console.error("Error while getting blogs:", error);
    return next(
      new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Error while getting blogs",
        error
      )
    );
  }
};

module.exports = { getBlog };
