// controllers/form/formController.js
const { addMember } = require('./member/addMember');
const { deleteMember } = require('./member/deleteMember');
const { updateUser }= require('./member/editProfile');
const { deleteUser } = require('./user/deleteUser');
const { fetchTeam } = require('./user/getTeam');
const { fetchUser } = require('./user/getUser');

module.exports = {
    updateUser,
    addMember,
    fetchUser,
    fetchTeam,
    deleteMember,
    deleteUser
};