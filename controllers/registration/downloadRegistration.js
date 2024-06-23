const ExcelJS = require('exceljs');
const { PrismaClient } = require('@prisma/client');
const expressAsyncHandler = require('express-async-handler');
const prisma = new PrismaClient();

const downloadRegistration = expressAsyncHandler(async (req, res, next) => {
    const formId = req.params.id;

    if (!formId) {
        return next(new Error('FormId is missing'));
    }

    try {
        // Fetch data from the database
        const formData = await prisma.formRegistration.findMany({
            where: { formId: formId }
        });

        if (!formData || formData.length === 0) {
            return next(new Error('Form data not found'));
        }

        // Prepare the workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Form Registrations');

        // Initialize headers and rows
        let headers = ['userId', 'formId']; // Include userId and formId as initial headers
        let rows = [];

        // Iterate through each formData entry to collect headers and rows
        formData.forEach(entry => {
            let row = { userId: entry.userId, formId: entry.formId }; // Add userId and formId to each row
            entry.value.forEach(section => {
                // Add section properties as columns
                Object.keys(section).forEach(key => {
                    if (key !== 'sectionId' && key !== 'sectionNo' && key !== 'sectionTitle') {
                        // Create unique headers
                        if (!headers.includes(key)) {
                            headers.push(key);
                        }
                        // Populate row with section data
                        row[key] = Array.isArray(section[key]) ? section[key].join(', ') : section[key];
                    }
                });
            });
            rows.push(row); // Add row to rows array
        });

        // Add headers to worksheet
        worksheet.columns = headers.map(header => ({ header, key: header }));

        // Add rows to worksheet
        rows.forEach(rowData => {
            worksheet.addRow(rowData);
        });

        // Write the workbook to a buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Set the appropriate headers for downloading the Excel file
        res.setHeader('Content-Disposition', 'attachment; filename=form_registrations.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        return next(error);
    }
});

module.exports = { downloadRegistration };
