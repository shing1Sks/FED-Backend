const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../error/ApiError');

const updateUser = async (key, data, override = {}) => {
    console.log("Updating existing user");

    // Extract formIds from data and override if present
    let newFormIds = [];
    if (data.forms && Array.isArray(data.forms)) {
        newFormIds = data.forms;
        delete data.forms;
    }
    if (override.forms && Array.isArray(override.forms)) {
        newFormIds = [...newFormIds, ...override.forms];
        delete override.forms;
    }

    // Build the update data object
    let updateData = {
        ...data,
        ...override,
    };

    if (newFormIds.length > 0) {
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
        data: updateData, ...key,
    });

    console.log(`Updated user with ${JSON.stringify(key)} successfully!`);
    return user;
};

module.exports = updateUser;
