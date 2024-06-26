// uploadImage.js
const cloudinary = require('../../utils/image/cloudinary');
const fs = require('fs');
const ApiError = require('../../utils/error/ApiError');

const uploadImage = async (filePath) => {
    try {
        console.log("Uploading file:", filePath);
        const result = await cloudinary.uploader.upload(filePath);
        // Remove file from server after upload to Cloudinary
        fs.unlinkSync(filePath);

        console.log("Image uploaded successfully:", result);
        return result;
    } catch (err) {
        console.error("Error while uploading image:", err);
        throw new ApiError(500, "Error while uploading image", err);
    }
};

module.exports = uploadImage;
