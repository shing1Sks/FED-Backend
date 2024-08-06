const jwt = require('jsonwebtoken');
const { PrismaClient, AccessTypes } = require('@prisma/client');
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/error/ApiError');
const createUser = require('../../../utils/user/createUser');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const sendMailFlag = false;

const googleAuth = expressAsyncHandler(async (req, res, next) => {
    try {
        const { id: rawId, ...data } = req.body; // Rename 'id' to 'rawId' to avoid conflicts
        const { email, name, img } = data;
        console.log(req.body);
    
        let user = await prisma.user.findUnique({
            where: { email }
        });
    
        if (user) {
            const isPasswordValid = await bcrypt.compare(rawId, user.password);
            if (!isPasswordValid) {
                return next(new ApiError(404, 'Google Authentication Failed'));
            }
            const token = jwt.sign({ id: user.id, email: user.email, loginTime: new Date().toISOString() }, process.env.JWT_SECRET, { expiresIn: '7h' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
            });
            res.status(200).json({ message: 'User logged in successfully', token: token });
        } else {
            const hashedId = await bcrypt.hash(rawId, 10); // Hash the raw ID value
            data.password = hashedId;
            data.name = name;
            data.img = img;
            data.access = AccessTypes.USER;
    
            user = await createUser(data, sendMailFlag);
            if(!user){
                return next(new ApiError(500,"unable to create user"));
            }
    
        }
        //sanitize user
        delete user.password;
    
        const token = jwt.sign({ id: newUser.id, email, loginTime: new Date().toISOString() }, process.env.JWT_SECRET, { expiresIn: '7h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true
        });
        res.status(201).json({ message: 'Authentication successfully', user: user, token });
    
    } catch (error) {
        
    }
});

module.exports = { googleAuth };