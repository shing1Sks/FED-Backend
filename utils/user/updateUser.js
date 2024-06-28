const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../error/ApiError');

const updateUser = async (key, data, override = {}) => {
    console.log("Updating existing user");
    const user = await prisma.user.update({
        where: key,
        data: {
            ...data,
            ...override,
        },
    });

    console.log(`Updated user with ${JSON.stringify(key)} successfully!`);
    return user;
};

module.exports = updateUser;
