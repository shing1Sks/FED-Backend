const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../../utils/ApiError');

// @description     Add registration for a form
// @route           POST /api/form/addRegistration
// @access          Public (or as per your authentication requirements)
const addRegistration = async (req, res, next) => {
    try {
        // Extract formId and formData from request body
        const { formId, formData } = req.body;

        // Check if the form exists
        const formExists = await prisma.form.findUnique({
            where: { id: formId }
        });

        if (!formExists) {
            return next(new ApiError(404, `Form not found`));
        }

        // Print the form data
        console.log("form data on page -> ./controllers/registration/addRegistration \n", formExists);

        // Check if formData is an array before logging its length
        if (!Array.isArray(formData)) {
            console.log("Form data should be an array");
            return next(new ApiError(400, 'Invalid data format: formData should be an array'));
        }

        // Example condition based on formExists.teamsize

        console.log("min team size ",formExists.minteamsize);
        console.log('maxSize',formExists.maxteamsize)
        console.log(formData.lengthrs);
        if (formExists.teamsize && formData.length > formExists.maxteamsize && formData.length < formExists.minteamsize) {
            return next(new ApiError(400, `Team size error. Minimun Size : ${formExists.minteamsize}, Maximux Size : ${formExists.maxteamsize}.`));
        }

        // Extract emails from formData and include req.user.email
        const regUserEmails = formData.map(data => data.email);
        regUserEmails.push(req.user.email);
        console.log(regUserEmails);

        // Check if user is already registered for the form
        const registrationExists = await prisma.formRegistration.findFirst({
            where: {
                OR: [
                    { userId: req.user.id },
                    {
                        regUserEmails: {
                            hasSome: regUserEmails // Assuming regUserEmails is an array of strings
                        }
                    }
                ],
                AND: {
                    formId: formId
                }
            }
        });

        if (registrationExists) {
            return next(new ApiError(400, `User is already registered in this event`));
        }

        // Create new registration entry
        const newRegistration = await prisma.formRegistration.create({
            data: {
                user: { connect: { id: req.user.id } },
                form: { connect: { id: formId } },
                value: formData,
                regUserEmails: regUserEmails // Storing the array of emails
            }
        });

        res.status(201).json({
            success: true,
            message: 'Registration added successfully',
            data: newRegistration,
        });
    } catch (error) {
        console.error('Error in adding registration:', error);
        return next(new ApiError(500, 'Error in adding registration', error));
    }
};

module.exports = { addRegistration };
