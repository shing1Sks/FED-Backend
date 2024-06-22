const ExcelJS = require('exceljs');
const { PrismaClient } = require('@prisma/client');
const expressAsyncHandler = require('express-async-handler');
const prisma = new PrismaClient();

const downloadRegistration = expressAsyncHandler(async (req, res, next) => {
    const formId = req.params.id;

    if (!formId) {
        return next(new ApiError(400, 'FormId is missing'));
    }

    // Fetch data from the database
    const formData = await prisma.formRegistration.findMany({
        where: { formId }
    });

    console.log(formData);

    if (formData.length === 0) {
        return next(new ApiError(404, 'No data found'));
    }

    // Prepare the workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Get unique keys for the header row
    const uniqueKeys = new Set();

    formData.forEach(item => {
        uniqueKeys.add('id');
        uniqueKeys.add('userId');
        uniqueKeys.add('formId');
        uniqueKeys.add('regUserEmails');
        
        if (item.value && Array.isArray(item.value)) {
            item.value.forEach((val, index) => {
                Object.keys(val).forEach(key => {
                    uniqueKeys.add(`${key}${index + 1}`);
                });
            });
        }
    });

    const columns = Array.from(uniqueKeys).map(key => ({ header: key, key }));
    console.log(columns);

    worksheet.columns = columns;

    // Add rows
    formData.forEach(item => {
        const row = {
            id: item.id,
            userId: item.userId,
            formId: item.formId,
            regUserEmails: item.regUserEmails.join(', '),
        };

        if (item.value && Array.isArray(item.value)) {
            item.value.forEach((val, index) => {
                Object.keys(val).forEach(key => {
                    row[`${key}${index + 1}`] = val[key];
                });
            });
        }

        worksheet.addRow(row);
    });

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set the appropriate headers
    res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

module.exports = { downloadRegistration };
