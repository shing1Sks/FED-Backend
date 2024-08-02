const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../error/ApiError');

const updateUser = async (key, data) => {
    console.log("Updating existing user");

    let newFormIds = null;

    // Build the update data object
    let updateData = {
        ...data
    };

    if (data.forms) {
        newFormIds = data.forms;
        delete data.forms;
        updateData = {
            ...updateData,
            forms: {
                push: newFormIds
            }
        };
    }

    // Update the user
    const user = await prisma.user.update({
        where: key,
        data: updateData
    });

    console.log(`Updated user with ${JSON.stringify(key)} successfully!`);
    return user;
};

module.exports = updateUser;
