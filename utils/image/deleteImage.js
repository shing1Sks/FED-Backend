const cloudinary = require('../../config/cloudinary');
const ApiError = require('../../utils/error/ApiError');

const deleteImage = async (imageUrl) => {
    try {
        let imageName = imageUrl.split('/').pop().split('.')[0];
        console.log(imageName);
        const result = await cloudinary.uploader.destroy(imageName);
        console.log(result)
        return result;
    } catch (err) {
        console.error("Error while deleting image:", err);
        throw new ApiError(500, "Error while deleting image", err);
    }
};

module.exports = deleteImage;
