const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createUser = async (data, override = {}) => {
    const email = data.email;
    try {
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new Error("User already exists with this email");
        }

        const user = await prisma.user.create({
            data: {
                ...data,
                ...override
            }
        });
        return user;
    } catch (error) {
        console.error('Error in creating user:', error);
        throw error; // Propagate the error to the calling function
    }
};

module.exports = createUser;
