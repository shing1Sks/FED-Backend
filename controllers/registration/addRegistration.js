const { PrismaClient, AccessTypes } = require("@prisma/client");
const prisma = new PrismaClient();
const { ApiError } = require("../../utils/error/ApiError");
const expressAsyncHandler = require("express-async-handler");
const updateUser = require("../../utils/user/updateUser");

const validateCurrentForm = expressAsyncHandler(async (form, user, userSubmittedSections) => {
    const { info, sections, formAnalytics } = form;

    const { eventMaxReg, isRegistrationClosed, isEventPast, isPublic } = info;

    if (isRegistrationClosed === 'true' || isEventPast === 'true') {
        throw new ApiError(400, "Registration Closed for this event!!");
    }

    if (!isPublic && req.user.access != AccessTypes.ADMIN) {
        throw new ApiError(401, "Registering to a private form is not allowed");
    }

    console.log(formAnalytics[0]?.regUserEmails)
    console.log(user.regForm)
    const isAlreadyRegistered = formAnalytics[0]?.regUserEmails.includes(user.email) || user.regForm.includes(form._id);
    if (isAlreadyRegistered) {
        throw new ApiError(400, "User has already registered for this form");
    }
    console.log("Form analytics ", formAnalytics[0])
    if (formAnalytics[0]?.regUserEmails?.length >= eventMaxReg) {
        throw new ApiError(400, "Maximum registration limit reached");
    }

    // const arrayOfFormSections = sections.map(section => section._id);
    // const arrayOfFormFields = sections.flatMap(section => section.fields.map(field => field._id));

    // console.log("Actual form sections", arrayOfFormSections);
    // console.log("Actual form fields", arrayOfFormFields);

    // let isFormSanitized = userSubmittedSections.every(section => {
    //     if (!arrayOfFormSections.includes(section._id)) {
    //         console.log("Manipulated section: " + section.name, section._id);
    //         return false;
    //     } else {
    //         console.log("Entering field search for: ", section.name);
    //         return section.fields.every(field => {
    //             if (!arrayOfFormFields.includes(field._id)) {
    //                 console.log("Manipulated field: " + field.name, field._id);
    //                 return false;
    //             }
    //             return true;
    //         });
    //     }
    // });

    // console.log(isFormSanitized)

    // if (!isFormSanitized) {
    //     throw new ApiError(400, "Manipulated section/Field data");
    // }

    // console.log("correct sections value", isFormSanitized);
});


const addRegistration = expressAsyncHandler(async (req, res, next) => {


    // console.log("Entering add" ,req.body);

    const { _id } = req.body;
    let sections = req.body.sections;
    sections = JSON.parse(sections);

    // Filter out null values from sections
    sections = sections.filter(section => section !== null);
    console.log("filtered sections", sections);

    console.log("updated sections ",sections);

    if (!_id || !sections || !Array.isArray(sections)) {
        return next(new ApiError(400, "All fields are required"));
    }

    try {
        const form = await prisma.form.findUnique({
            where: { id: _id },
            include: { formAnalytics: true },
        });
        if (!form) {
            return next(new ApiError(404, "Form not found"));
        }

        await validateCurrentForm(form, req.user, sections);
        console.log('form validation passed');

        const { info } = form;
        const { relatedEvent } = info;

        let relatedEventForm = null;
        if (relatedEvent && relatedEvent !== "null" && relatedEvent !== null) {
            relatedEventForm = await prisma.form.findUnique({
                where: { id: relatedEvent },
                include: { formAnalytics: true }
            });

            if (!relatedEventForm) {
                throw new ApiError(404, "Related Event not found");
            }

            // const userAlreadyRegisteredInRelatedForm = relatedEventForm.formAnalytics[0]?.regUserEmails?.includes(user.email);
            console.log(req.user.regForm.includes(form.relatedEvent))
            console.log("related event regUserEmails", relatedEventForm.formAnalytics[0]?.regUserEmails)

            const userAlreadyRegisteredInRelatedForm = req.user.regForm.includes(form.relatedEvent) || relatedEventForm.formAnalytics[0]?.regUserEmails?.includes(req.user.email);

            if (!userAlreadyRegisteredInRelatedForm) {
                throw new ApiError(400, `User must be registered in the related event : ${relatedEventForm.info.eventTitle}`);
            }
            console.log("related event check passed");
        }
        let regTeamMemEmails = [];
        // const values = [];

        let teamName = req.user.name;
        let teamCode = req.user.email;

        if (relatedEvent && relatedEvent !== "null") {

            console.log("related", relatedEventForm.info.eventTitle)
            console.log("eventTitle", info.eventTitle)
            console.log("count", form.formAnalytics[0]?.regUserEmails.length);
            teamCode = await generateTeamCode(relatedEventForm.info.eventTitle, info.eventTitle, form.formAnalytics[0]?.regUserEmails.length);
        }

        console.log("Team Code : ", teamCode)
        const sectionsObject = [{ sections: sections }];

        if (form.info.participationType !== "Individual") {
            const createTeamSection = sections.find(section => section.name === "Create Team");
            const joinTeamSection = sections.find(section => section.name === "Join Team");

            if (createTeamSection) {
                const teamNameField = createTeamSection.fields.find(field => field.name === "Team Name");

                if (teamNameField) {
                    teamName = teamNameField.value;
                    regTeamMemEmails.push(req.user.email);
                } else {
                    return next(new ApiError(400, "Team Name field is required for Create Team"));
                }
            } else if (joinTeamSection) {
                const teamCodeField = joinTeamSection.fields.find(field => field.name === "Team Code");

                if (teamCodeField) {
                    const teamExists = await prisma.formRegistration.findUnique({
                        where: {
                            formId_teamCode: {
                                formId: _id,
                                teamCode: teamCodeField.value
                            }

                        },
                    });

                    if (!teamExists) {
                        return next(new ApiError(404, "Invalid team code"));
                    }

                    if (teamExists.regTeamMemEmails.length >= form.info.maxTeamSize) {
                        return next(new ApiError(400, "Team size exceeded"));
                    }

                    // Log the teamExists object in a readable format
                    console.log("team Exists", JSON.stringify(teamExists, null, 2));



                    teamCode = teamCodeField.value;
                    regTeamMemEmails = [...teamExists.regTeamMemEmails, req.user.email];
                }
                sectionsObject.push({sections});
            }
            console.log("reg team members ", regTeamMemEmails)
        }

        
        console.log(sectionsObject)

        const registration = await prisma.formRegistration.upsert({
            where: {
                formId_teamCode: {
                    formId: _id, // Adjust this if needed based on your unique key
                    teamCode
                }

            },
            update: {
                userId: req.user.id,
                value: sectionsObject,
                regTeamMemEmails: {
                    set: regTeamMemEmails,
                }
            },
            create: {
                formId: _id,
                userId: req.user.id,
                value: sectionsObject,
                regTeamMemEmails: [req.user.email],
                teamCode,
                teamName,
            }
        });

        const updatedUser = await updateUser({ email: req.user.email }, { regForm: _id });

        const updateFormRegistrationList = await prisma.registrationTracker.upsert({
            where: {
                formId: _id
            },
            update: {
                regUserEmails: {
                    push: req.user.email
                },
                regTeamNames: {
                    push: teamName
                },
            },
            create: {
                formId: _id,
                regUserEmails: [req.user.email],
                regTeamNames: teamName ? [teamName] : []
            }
        });

        console.log(updatedUser);
        console.log("regTracker", updateFormRegistrationList);

        res.json({ message: "Registration successful", teamName: registration.teamName, teamCode: registration.teamCode });
    }
    catch (error) {
        console.error("Error during registration:", error);
        next(new ApiError(error.stausCode || 500, error.message || "Error during registration process"));
    }

});


const generateTeamCode = async (relatedFormName, currentFormName, existingTeamsCount = 0) => {
    const relatedEventCode = relatedFormName?.slice(0, 2).toUpperCase();
    const currentFormCode = currentFormName?.slice(0, 2).toUpperCase();
    const teamCount = existingTeamsCount.toString().padStart(3, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000).toString();

    const teamCode = `${relatedEventCode ? relatedEventCode + "-" : ""}${currentFormCode ? currentFormCode + "-" : ""}${teamCount}-${randomNum}`;

    return teamCode;
};
module.exports = { addRegistration };
