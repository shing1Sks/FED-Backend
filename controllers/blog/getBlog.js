const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const status = require("http-status");
const { ApiError } = require("../../utils/error/ApiError");

const getBlogByAuthor = async (req, res, next) => {
  try {
    const { author } = req.params;
    const allBlogs = await prisma.blog.findMany();

    const blogs = allBlogs.filter((blog) => {
      try {
        const parsedAuthor = JSON.parse(blog.author);
        return parsedAuthor.name === author;
      } catch {
        return false;
      }
    });

    if (!blogs.length) {
      return next(
        new ApiError(status.NOT_FOUND, "No blogs found for this author")
      );
    }

    res
      .status(status.OK)
      .json({ message: "Blogs fetched successfully", blogs });
  } catch (error) {
    console.error("Error fetching blog by author:", error);
    next(new ApiError(status.INTERNAL_SERVER_ERROR, "Error fetching blog"));
  }
};

const getBlogByVisibility = async (req, res, next) => {
  try {
    const { visibility } = req.params;
    const blogs = await prisma.blog.findMany({
      where: { visibility },
    });

    if (!blogs.length) {
      return next(
        new ApiError(status.NOT_FOUND, "No blogs with this visibility")
      );
    }

    res
      .status(status.OK)
      .json({ message: "Blogs fetched successfully", blogs });
  } catch (error) {
    console.error("Error fetching blog by visibility:", error);
    next(new ApiError(status.INTERNAL_SERVER_ERROR, "Error fetching blog"));
  }
};

const getBlogByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const blogs = await prisma.blog.findMany({
      where: { category },
    });

    if (!blogs.length) {
      return next(
        new ApiError(status.NOT_FOUND, "No blogs found in this category")
      );
    }

    res
      .status(status.OK)
      .json({ message: "Blogs fetched successfully", blogs });
  } catch (error) {
    console.error("Error fetching blog by category:", error);
    next(new ApiError(status.INTERNAL_SERVER_ERROR, "Error fetching blog"));
  }
};

const getBlogByDepartment = async (req, res, next) => {
  try {
    const { department } = req.params;
    if (!department) {
      return next(
        new ApiError(status.BAD_REQUEST, "Department parameter is required")
      );
    }

    const allBlogs = await prisma.blog.findMany();
    const blogs = allBlogs.filter((blog) => {
      try {
        const parsedAuthor = JSON.parse(blog.author);
        return parsedAuthor.department === department;
      } catch {
        return false;
      }
    });

    if (!blogs.length) {
      return next(
        new ApiError(status.NOT_FOUND, "No blogs found with this department")
      );
    }

    res
      .status(status.OK)
      .json({ message: "Blogs fetched successfully", blogs });
  } catch (error) {
    console.error("Error fetching blog by department:", error);
    next(new ApiError(status.INTERNAL_SERVER_ERROR, "Error fetching blog"));
  }
};

module.exports = {
  getBlogByAuthor,
  getBlogByVisibility,
  getBlogByCategory,
  getBlogByDepartment,
};
