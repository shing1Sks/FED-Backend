const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { USER } = require('../enum/access');

const createUser = async(data, override={})=>{
    const email = data.email;
    try{
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
    
        if (existingUser) {
            return next(new ApiError(400, "User already exists with this email"));
        }

        const user = await prisma.user.create({
            data: {
                ...data,
                ...override
            }
        });
        return user;
    }
    catch (error){
        console.error('Error in creating user:', error);
        next(new ApiError(500, 'Error in creating user', error)); // Send error with ApiError
    }
}

module.exports = createUser