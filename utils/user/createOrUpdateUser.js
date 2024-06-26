const { PrismaClient } = require('@prisma/client');
const { ApiError } = require('../error/ApiError');
const prisma = new PrismaClient();

const createOrUpdateUser = async (key, data, override = {}) => {
    if(!key){
        if(data.id){
            key = {id : data.id}
        }
        else if(data.email)
        {
            key = { email : data.email }
        }
        else {
            throw new ApiError(400,"key is required to update or check validity constraint")
        }
    }
    try {
        // Warning Check if user Exist or not before calling this funcdtion
        const user = await prisma.user.upsert({
            where : key,
            update : {
                ...override
            },
            create: {
                ...data,
                ...override
            }
        });
        return user;
    } catch (error) {
        console.error('Error in creating user:', error);
        throw new ApiError(error.statusCode, " Error creating the user ", error); // Propagate the error to the calling function
    }
};

module.exports = createOrUpdateUser;