// utils/uploadImage.js

const cloudinary = require('../utils/cloudinary'); // Adjust path as necessary
const ApiError = require('../utils/ApiError');
const fs = require('fs');

async function uploadImage(filePath) {
    try {
        const result = await cloudinary.uploader.upload(filePath);
        // Remove file from server after upload to Cloudinary
        fs.unlinkSync(filePath);

        return {
            success: true,
            data: result,
            message: "Image uploaded successfully"
        };
    } catch (err) {
        throw new ApiError(500, "Error while uploading image", err);
    }
}

module.exports = uploadImage;

// filewatecher automatically calss a fn file naminf convection