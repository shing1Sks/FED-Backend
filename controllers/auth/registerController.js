const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../utils/error/ApiError');
const { USER } = require('../../enum/access');
const createUser = require('../../utils/user/createUser');
const uploadImage = require('../../utils/image/uploadImage');
const encodeImageToBlurhash = require('../../utils/image/blurHash');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

//@description     Register a User
//@route           POST /api/auth/register
//@access          Public
const register = expressAsyncHandler(async (req, res, next) => {
    console.log("file starts from here ", req.file)
    console.log("Body starts from here", req.body)
    const { email, password, name } = req.body;

    // Validate request body
    if (!email || !password || !name) {
        return next(new ApiError(400, "Missing required fields: email, password, name"));
    }

    try {
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return next(new ApiError(400, "User already exists with this email"));
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // List fields to override in req body
        const override = {
            password: hashedPassword,
            access: USER
        };

        const user = await createUser(req.body, override);
        if (!user) {
            return next(new ApiError(500, 'Error in creating user'));
        }

        // Generate the JWT Token
        const token = jwt.sign({ id: user.id, email, loginTime: new Date().toISOString() }, process.env.JWT_SECRET, { expiresIn: '7h' });

        // Send the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour in milliseconds
        });

        // Respond to the client immediately
        res.status(201).json({ message: 'User created successfully' });

        // Process image upload and blurhash encoding in the background
        if (req.file) {
            console.log("File present in the request body");
            try {
                // Encode Blurhash
                const imgBlurHash = await encodeImageToBlurhash(req.file.path);
                console.log('Blurhash:', imgBlurHash);
            } catch (blurhashError) {
                console.error('Error in encoding blurhash:', blurhashError);
                // Handle Blurhash error, e.g., log it or notify admin
            }

            try {
                // Upload image to Cloudinary
                const uploadedImage = await uploadImage(req.file.path);
                console.log('Uploaded Image:', uploadedImage);
            } catch (cloudinaryError) {
                console.error('Error in uploading image to Cloudinary:', cloudinaryError);
                // Handle Cloudinary upload error, e.g., log it or notify admin
            }
        } else {
            console.log("Request file is not present");
        }
    } catch (error) {
        console.error('Error in registering user:', error);
        next(new ApiError(500, 'Error in registering user', error)); // Send error with ApiError
    }
});

module.exports = { register };
