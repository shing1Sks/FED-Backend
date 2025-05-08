const { ApiError } = require("../../utils/error/ApiError");
const { PrismaClient } = require('@prisma/client');
const uploadImage = require("../../utils/image/uploadImage");
const prisma = new PrismaClient();
const status = require("http-status");

const createBlog = async (req, res, next) => {
    try {
        
        // Check if the request contains a file
        if (!req.file) {
            return next(new ApiError(status.BAD_REQUEST, "Image file is required"));
        }

        // Check if the request contains all required fields
        const { title, author, blogLink, desc, date, visibility, approval, summary } = req.body;

        const image = await uploadImage(req.file.path, "BLOG");

        if (!title || !author || !blogLink || !desc || !date ) {
            return next(new ApiError(status.BAD_REQUEST, "All fields are required"));
        }
        const blog = await prisma.blog.create({
            data: {
                image : image.secure_url,
                title,
                author,
                blogLink,
                desc,
                date,
                visibility,
                approval,
                summary,
            },
        });
        res.status(status.OK).json({ message: "Blog created successfully", blog });
    }
    catch (error) {
        console.error("Error creating blog:", error);
        next(new ApiError(status.INTERNAL_SERVER_ERROR, "An error occurred while creating the blog"));
    }
}

module.exports = { createBlog };