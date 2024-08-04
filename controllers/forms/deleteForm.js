// controllers/form/deleteForm.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../../utils/error/ApiError');
const deleteImage = require('../../utils/image/deleteImage');

//@description     Delete Form
//@route           delete /api/form/deleteForm/:id
//@access          Admins
const deleteForm = async (req, res, next) => {
    console.log("deleteForm");
    try {
        const formId = req.params.id;

        const deletedForm = await prisma.form.delete({
            where: { id: formId },
        });

        // Delete image from cloudinary
        if(deletedForm && deletedForm.info && deletedForm.info.eventImg){
            deleteImage(deletedForm.info.eventImg)
        }

        if(req.body.deleteRegistations){
            await prisma.formRegistration.delete({
                where : { formId : formId }
            })
        }

        res.status(200).json({
            success: true,
            message: 'Form deleted successfully',
        });
    } catch (error) {
        console.error('Error in deleting form:', error);
        return next(new ApiError(500, 'Error in deleting form', error));
    }
};

module.exports = { deleteForm };
