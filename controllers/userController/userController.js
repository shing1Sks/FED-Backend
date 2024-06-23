// controllers/form/formController.js
const { addMember } = require('./member/addMember');
const { deleteMember } = require('./member/deleteMember');
const { updateUser }= require('./member/editProfile');
const { fetchTeam } = require('./user/getTeam');
const { fetchUser } = require('./getUser');

module.exports = {
    updateUser,
    addMember,
    fetchUser,
    fetchTeam,
    deleteMember
};