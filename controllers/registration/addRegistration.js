const { PrismaClient, Prisma, AccessTypes } = require("@prisma/client");
const prisma = new PrismaClient();
const { ApiError } = require("../../utils/error/ApiError");
const expressAsyncHandler = require("express-async-handler");

const addRegistration = expressAsyncHandler(async (req, res, next) => {
    const teamCode = generateTeamCode('OMEGA','PITCHER')
    console.log(teamCode);

    // console.log('add reg - ',req.body);
    // const { _id, name, field_id, field_name, field_value } = req.body;

    // if (!_id || !field_id || !field_name || !field_value ) {
    //     return next(new ApiError(400, "All fields are required"));
    // }

    // try {
    //     // Check if the form exists
    //     const form = await prisma.form.findUnique({
    //         where: { id: _id }
    //     });

    //     if (!form) {
    //         return next(new ApiError(404, "Form not found"));
    //     }

    //     if(form.info.isRegistrationClosed){
    //         return next(new ApiError(400, "Registration Closed for this event!!"));
    //     }

    //     if(form.info.isEventPast){
    //         return next(new ApiError(400, "Cannot Register to a past event"));
    //     }

    //     if(form.info.isPublic && req.user.access != AccessTypes.ADMIN){
    //         return next(new ApiError(401, "Registring to a private form is not allowed"));
    //     }


    //     // Extract form info
    //     const { info } = form;
    //     const maxReg = info.maxReg;
    //     const relatedEvent = info.relatedEvent;

    //     // Check if user is already registered for the form
    //     const isAlreadyRegistered = await prisma.formRegistration.findFirst({
    //         where: {
    //             formId: _id,
    //             userId: user.id,
    //             regTeamMemEmails: { has: user.email },
    //         },
    //     });

    //     if (isAlreadyRegistered) {
    //         return next(new ApiError(400, "User is already registered for this form"));
    //     }

    //     // Check if the user has already registered in the related event (if applicable)
    //     if (relatedEvent) {
    //         const relatedForm = await prisma.form.findUnique({
    //             where: { id: relatedEvent }
    //         });

    //         if (relatedForm) {
    //             const userAlreadyRegisteredInRelatedForm = relatedForm.userForms.some(registration => 
    //                 registration.userId === user.id
    //             );

    //             if (!userAlreadyRegisteredInRelatedForm) {
    //                 return next(new ApiError(400, "User must be registered in the related event"));
    //             }
    //         }
    //     }

    //     // Check max registrations
    //     const currentRegistrations = await prisma.formRegistration.count({
    //         where: { formId: _id },
    //     });[[]]

    //     if (currentRegistrations >= maxReg) {
    //         return next(new ApiError(400, "Maximum registration limit reached"));
    //     }

    //     let teamCode = null;
    //     const regTeamMemEmails = [];
    //     const values = [];

    //     if (field_value[field_name.indexOf("Team Option")] === "Create Team") {
    //         teamCode = generateTeamCode(relatedForm.info.eventTitle,form.info.eventTitle); // Generate a new team code
    //         regTeamMemEmails.push(user.email); // Add the user to the team

    //         // Push remaining data to values
    //         field_id.forEach((id, index) => {
    //             values.push({
    //                 fieldId: id,
    //                 fieldName: field_name[index],
    //                 fieldValue: field_value[index],
    //             });
    //         });

    //     } else if (field_value[field_name.indexOf("Team Option")] === "Join Team") {
    //         const teamCodeField = field_value[field_name.indexOf("Team Code")];

    //         // Check if the team code exists and is valid
    //         const teamExists = await prisma.formRegistration.findFirst({
    //             where: { teamCode: teamCodeField },
    //         });

    //         if (!teamExists) {
    //             return next(new ApiError(400, "Invalid team code"));
    //         }

    //         // Add the user to the team's registration list
    //         regTeamMemEmails.push(user.email);

    //         // Push remaining data to values
    //         field_id.forEach((id, index) => {
    //             values.push({
    //                 fieldId: id,
    //                 fieldName: field_name[index],
    //                 fieldValue: field_value[index],
    //             });
    //         });
    //     } else {
    //         return next(new ApiError(400, "Invalid team option"));
    //     }

    //     // Create or update registration
    //     const registration = await prisma.formRegistration.create({
    //         data: {
    //             formId: _id,
    //             userId: user.id,
    //             value: values,
    //             regTeamMemEmails,
    //             teamCode,
    //         },
    //     });

    //     res.json({ message: "Registration successful", registration });
    // } catch (error) {
    //     console.error("Error during registration:", error);
    //     next(new ApiError(500, "Error during registration process"));
    // }
});

const generateTeamCode = async (relatedEventName, currentFormName) => {
    const relatedEventCode = relatedEventName.slice(0, 2).toUpperCase();
    const currentFormCode = currentFormName.slice(0, 2).toUpperCase();

    // Get the count of teams already created for the current form to generate a unique number
    const existingTeamsCount = await prisma.formRegistration.count({
        where: { teamCode: { startsWith: relatedEventCode + currentFormCode } },
    });

    const uniqueNumber = existingTeamsCount.toString().padStart(3, '0');

    return `${relatedEventCode}${currentFormCode}${uniqueNumber}`;
};

module.exports = {addRegistration}