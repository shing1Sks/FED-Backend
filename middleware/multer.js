const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        // Add any file filtering logic if needed
        cb(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
    }
});

module.exports = upload;
    