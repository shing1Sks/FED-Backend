// uploadImage.js
const cloudinary = require('../../utils/image/cloudinary');
const upload = require('../../middleware/multer');
const expressAsyncHandler = require('express-async-handler');
const ApiError = require('../../utils/error/ApiError');
const fs = require('fs');

const uploadImage = expressAsyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ApiError(400, "No file uploaded"));
    }

    try {

        console.log("uploading file -", req.file.path)
        const result = await cloudinary.uploader.upload(req.file.path);
        // Remove file from server after upload to Cloudinary
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            data: result,
            message: "Image uploaded successfully"
        });
    } catch (err) {
        return next(new ApiError(500, "Error while uploading image", err));
    }
});

module.exports = { uploadImage };
