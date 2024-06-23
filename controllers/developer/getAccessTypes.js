const AccessTypes = require('../../enum/access');
const expressAsyncHandler = require('express-async-handler');

// @description     Get all access types
// @route           GET /api/accessTypes
// @access          To be decided
const getAccessTypes = expressAsyncHandler(async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: AccessTypes,
        });
    } catch (error) {
        console.error('Error fetching access types:', error);
        next(new ApiError(500, 'Error fetching access types', error));
    }
});

module.exports = { getAccessTypes };
