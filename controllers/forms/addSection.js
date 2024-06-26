const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../../utils/error/ApiError');

// @description     Add section to form
// @route           POST /api/form/:formId/addSection
// @access          Admins
const addSection = async (req, res, next) => {
    try {
        const { formId } = req.body;
        console.log(formId)

        // Check if the form exists
        const formExists = await prisma.form.findUnique({
            where: { id: formId }
        });

        if (!formExists) {
            return next(new ApiError(404, 'Form not found'));
        }

        // Check if sectionNo is unique within the form
        const sectionExists = await prisma.section.findFirst({
            where: {
                formId: formId,
                sectionNo: req.body.sectionNo
            }
        });

        if (sectionExists) {
            return next(new ApiError(400, 'Section number already exists in this form'));
        }

        // Create new section using Prisma
        const newSection = await prisma.section.create({
            data: {
                ...req.body
            }
        });
        // const newSection = await prisma.section.create({
        //     data: {
        //         formId: formId,
        //         sectionTitle: req.body.sectionTitle,
        //         sectionDesc: req.body.sectionDesc,
        //         sectionNo: req.body.sectionNo,
        //         fields: req.body.fields,
        //         conditions: req.body.conditions,
        //         extraData: req.body.extraData
        //     }
        // });

        res.status(201).json({
            success: true,
            message: 'Section added successfully',
            section: newSection,
        });
    } catch (error) {
        console.error('Error in adding section:', error);
        return next(new ApiError(500, 'Error in adding section', error));
    }
};

module.exports = { addSection };
