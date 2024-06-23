// controllers/form/formController.js
const { addForm }= require('./addForm');
const { editForm} = require('./editForm');
const { deleteForm }= require('./deleteForm');
const { getAllForms } = require('./getForm');
const { addSection } = require('./addSection');
const { getSections } = require('./getSection');

module.exports = {
    addForm,
    editForm,
    deleteForm,
    getAllForms,
    addSection,
    getSections
};
