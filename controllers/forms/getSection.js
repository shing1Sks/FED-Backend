const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../../utils/ApiError');

// @description     Get all sections of a form
// @route           GET /api/form/:formId/sections
// @access          Admins (or authenticated users depending on your requirements)
const getSections = async (req, res, next) => {
    try {
        const { formId, sectionNo, sectionId } = req.body;

        let query = {};
        
        if (sectionId) {
            query = { id: sectionId };
        } else if (formId && sectionNo) {
                query = { formId: formId, sectionNo: sectionNo };
        } else if (formId) {
            query = { formId: formId };
        }
        else {
            return next(new ApiError(400, 'Either provide (sectionNo and formId), formId or sectionId '));
        }

        // Check if the form exists
        if(formId){
            const formExists = await prisma.form.findUnique({
                where: { id: formId }
            });
            if (!formExists) {
                return next(new ApiError(404, 'Form not found'));
            }
        }

        const sections = await prisma.section.findMany({
            where:  query
        });

        
        if(!sections){
            return next(new ApiError(404, 'Section not found'));
        }

        res.status(200).json({
            success: true,
            sections: sections,
        });
    } catch (error) {
        console.error('Error in fetching sections:', error);
        return next(new ApiError(500, 'Error in fetching sections', error));
    }
};

module.exports = { getSections };
