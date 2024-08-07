// controllers/form/analytics.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../../utils/error/ApiError');
const expressAsyncHandler = require('express-async-handler');

// @description     Form analytics
// @route           GET /api/form/formAnalytics/:id
// @access          ADMIN
const analytics = expressAsyncHandler(async (req, res) => {
  const { id: formId } = req.params;
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { formAnalytics: true, userReg: true }
  });

  return res.status(200).json({ message: "success", form });
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
