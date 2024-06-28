// middleware/access/userAccess.js
const { isAdmin } = require('./isAdmin');
const { isMember } = require('./isMember');
const { isOnlyUser } = require('./isOnlyUser');
const { isUser } = require('./isUser');
const { isUserOrMember } = require('./isUserOrMember');

module.exports = {
    isAdmin,
    isOnlyUser,
    isMember,
    isUserOrMember,
    isUser
};