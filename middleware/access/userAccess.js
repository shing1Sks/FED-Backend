// middleware/access/userAccess.js
const { isAdmin } = require('./isAdmin');
const { isMember } = require('./isMember');
const { isUser } = require('./isUser');
const { isUserOrMember } = require('./isUserOrMember');

module.exports = {
    isAdmin,
    isUser,
    isMember,
    isUserOrMember
};