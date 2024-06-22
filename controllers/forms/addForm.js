const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../../utils/ApiError');

// @description     Add forms 
// @route           POST /api/form/addForm
// @access          Admins
const addForm = async (req, res, next) => {
    try {
        // Check if isTeam is false, then set maxteamsize and minteamsize to 1 in req.body
        if (!req.body.isTeam) {
            req.body.maxteamsize = 1;
            req.body.minteamsize = 1;
        }

        // Check if maxteamsize is less than minteamsize
        if (req.body.maxteamsize < req.body.minteamsize) {
            next(new ApiError(400, 'Max team size cannot be less than min team size'));
        }

        // Check if minteamsize is less than 0
        if (req.body.minteamsize < 0) {
            next(new ApiError(400, 'Min team size cannot be less than 0'));
        }

        // Create new form using Prisma
        const newForm = await prisma.form.create({
            data: req.body, // Use req.body directly
        });

        res.status(201).json({
            success: true,
            message: 'Form created successfully',
            form: newForm,
        });
    } catch (error) {
        console.error('Error in creating form:', error);
        return next(new ApiError(500, 'Error in creating form', error));
    }
};

module.exports = { addForm };
