const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../../utils/error/ApiError');

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
            return next(new ApiError(404, 'Form not found'));
        }

        // Print the form data
        console.log("formExists on page -> ./controllers/registration/addRegistration \n", formExists);

        // Check if formData is an array before logging its length
        if (!Array.isArray(formData)) {
            console.log("Form data should be an array");
            return next(new ApiError(400, 'Invalid data format: formData should be an array'));
        }

        // // Validate that each formData object contains keys matching the formFields
        // const requiredFields = formExists.formFields
        //     .filter(field => field.isRequired)
        //     .map(field => field.fieldName);

        // console.log(requiredFields);
        
        // for (const data of formData) {
        //     for (const field of requiredFields) {
        //         if (!(field in data)) {
        //             return next(new ApiError(400, `Missing required field in formData: ${field}`));
        //         }
        //     }   
        // }

        // Example condition based on formExists.teamsize
        // console.log("min team size ", formExists.minteamsize);
        // console.log('maxSize', formExists.maxteamsize);
        // console.log(formData.length);
        // if (formData.length > formExists.maxteamsize || formData.length < formExists.minteamsize) {
        //     return next(new ApiError(400, `Team size error. Minimum Size: ${formExists.minteamsize}, Maximum Size: ${formExists.maxteamsize}.`));
        // }

        // Extract emails from formData and include req.user.email
        const regUserEmails = getUniqueEmails(formData);
        console.log(regUserEmails);

        // Check if user is already registered for the form
        const registrationExists = await prisma.formRegistration.findFirst({
            where: {
                OR: [
                    { userId: req.user.id },
                    {
                        regUserEmails: {
                            hasSome: regUserEmails // regUserEmail -> array of String
                        }
                    }
                ],
                AND: {
                    formId: formId
                }
            }
        });

        if (registrationExists) {
            return next(new ApiError(400, 'User is already registered in this event'));
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


        await prisma.user.updateMany({
            where : {
                email : {
                    hasSome : regUserEmails
                }
            },
            data : {
                forms : push(formId)
            }
        })
    } catch (error) {
        console.error('Error in adding registration:', error);
        return next(new ApiError(500, 'Error in adding registration', error));
    }
};

function getUniqueEmails(data) {
  const emails = new Set();
  data.forEach(section => {
    if (section.email) {
      emails.add(section.email);
    }
  });
  return Array.from(emails);
}

module.exports = { addRegistration };
