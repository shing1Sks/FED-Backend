const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createUser = asyncHandler(async (req, res) => {
    console.log("Creating a new user");

    try {
        const user = await prisma.User.create({
            data: req.body,
        });

        res.status(200).send({ data: user, message: "User created successfully" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = { createUser };
