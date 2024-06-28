// controllers/form/formController.js
const { addMember } = require('./member/addMember');
const { deleteMember } = require('./member/deleteMember');
const { editProfile }= require('./member/editProfile');
const { deleteUser } = require('./user/deleteUser');
const { fetchTeam } = require('./user/getTeam');
const { fetchUser } = require('./user/getUser');

module.exports = {
    addMember,
    fetchUser,
    fetchTeam,
    editProfile,
    deleteMember,
    deleteUser
};