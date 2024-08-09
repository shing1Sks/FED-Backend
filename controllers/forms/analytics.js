// controllers/form/analytics.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../../utils/error/ApiError');
const expressAsyncHandler = require('express-async-handler');

// @description     Form analytics
// @route           GET /api/form/formAnalytics/:id
// @access          ADMIN
const analytics = expressAsyncHandler(async (req, res, next ) => {
  try {
    console.log("entering form analytics")
    const { id: formId } = req.params;
    let form = await prisma.form.findUnique({
      where: { id: formId },
      include: { formAnalytics: true, sections : false}
    });

    let formAnalytics = form.formAnalytics[0];
    formAnalytics.regCount = formAnalytics.regUserEmails.length;
    
    return res.status(200).json({ message: "success", form : form.formAnalytics[0] });
  } catch (error) {
    console.log(error)
    next(new ApiError(500,"Internal Server Error",error));
  }
});



// const addClickCount = expressAsyncHandler(async (req, res, next) => {
//   const { formId } = req.body;

//   await prisma.model.update({
//     where: { id: formId },
//     data: { value: { increment: 1 } }
//   });

//   return res.status(200).json({ message: "Click count incremented" });
// });

module.exports = { analytics };
