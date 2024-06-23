// middleware/access/userAccess.js
const { isAdmin } = require('./isAdmin');
const { isMember } = require('./isMember');
const { isMemberOrAdmin } = require('./isMemberOrAdmin');
const { isUser } = require('./isUser');
const { isUserOrAdmin } = require('./isUserOrAdmin');

module.exports = {
    isAdmin,
    isUserOrAdmin,
    isMemberOrAdmin,
    isUser,
    isMember
};