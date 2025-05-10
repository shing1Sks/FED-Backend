const { ApiError } = require("../../utils/error/ApiError");
const { PrismaClient } = require("@prisma/client");
const status = require("http-status");
const deleteImage = require("../../utils/image/deleteImage");

const prisma = new PrismaClient();

const deleteBlog = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if the blog exists
        const blog = await prisma.blog.findUnique({
            where: { id },
        });

        if (!blog) {
            return next(new ApiError(status.NOT_FOUND, "Blog not found"));
        }

        // Delete the image associated with the blog
        await deleteImage(blog.image, "BLOG");

        // Delete the blog
        await prisma.blog.delete({
            where: { id }, 
        });

        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Error deleting blog:", error);
        next(new ApiError(status.INTERNAL_SERVER_ERROR, "An error occurred while deleting the blog"));
    }
};

module.exports = { deleteBlog };
