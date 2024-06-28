const { PrismaClient, Prisma, AccessTypes } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { ApiError } = require('../error/ApiError');
const generateOtp = require('../otp/generateOTP');
const {sendMail} = require('../email/nodeMailer');
const loadTemplate = require('../../utils/email/loadTemplate')

const createOrUpdateUser = async (key, data, override = {}) => {
    console.log("Entering create or update user function");
    if (!key) {
        if (data.id) {
            key = { id: data.id };
        } else if (data.email) {
            key = { email: data.email };
        } else {
            throw new ApiError(400, "Key is required to update or check validity constraint");
        }
    }
    try {
        let user;
        let operation;
        try {
            //  Update the user
            user = await prisma.user.update({
                where: key,
                data: {
                    ...override,
                },
            });
            operation = 'updated';
            console.log(`Updated ${key} user successfully !`)
        } catch (error) {
            console.log("Error updating existing user, creating new user!");
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // Handle known Prisma errors
                if (error.code === 'P2025') {
                    // Record not found, create a new user
                    const defaultData = {
                        name: "Generated",
                        access: "USER",
                        year: "Generated",
                        img: "noimage",
                        rollNumber: "Generated",
                        school: "Generated",
                        college: "Generated",
                        contactNo: "Generated",
                        whatsappNo: "Generated",
                        forms: [],
                        extra: {},
                    };

                    const password = generateOtp(7, true, true, true);
                    const hashedPassword = await bcrypt.hash(password, 10);

                    user = await prisma.user.create({
                        data: {
                            ...defaultData,
                            ...data,
                            ...override,
                            email: key.email,
                            password: hashedPassword,
                        },
                    });
                    operation = 'created';

                    console.log(`Created ${key} with access ${override.access || data.access || defaultData.access } successfully !`)

                    // Send email with password to the new user
                    const templateName = 'newUserAutoRegistration';
                    const subject = 'Welcome to FED KIIT';
                    const placeholders = { password: password, name: user.name };

                    console.log("Looading Template", templateName);
                    const templateContent = loadTemplate(templateName, placeholders );

                    console.log("Sending email to ", user.email);
                    sendMail(user.email, subject, templateContent);

                } else {
                    throw error; // Rethrow other errors
                }
            } else {
                throw error; // Rethrow other errors
            }
        }
        console.log(user,operation);

        return { user, operation };
    } catch (error) {
        console.error('Error in creating or updating user:', error);
        throw new ApiError(error.statusCode || 500, error.message || 'Internal Server Error', error);
    }
};

module.exports = createOrUpdateUser;
