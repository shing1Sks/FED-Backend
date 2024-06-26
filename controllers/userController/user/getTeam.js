const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const expressAsyncHandler = require('express-async-handler');
const { ApiError } = require('../../../utils/error/ApiError');

//@description     Fetch Teams
//@route           GET /api/user/team
//@access          Admin
const fetchTeam = expressAsyncHandler(async (req, res, next) => {
    try {
        // Fetch users where member is not null
        const users = await prisma.user.findMany({
            where: {
                member: {
                    not: null
                }
            },
            select : {
                name: true,
                email:true,
                "member": true,
                password : false
            }
        });

        // Filter out users with empty member objects
        const teams = users.filter(user => {
            const member = user.member;
            return member && Object.keys(member).length > 0;
        });

        if (teams.length === 0) {
            return next(new ApiError(404, 'No teams found'));
        }

        res.status(200).json({ success: true, data: teams });
    } catch (error) {
        console.error('Error fetching teams:', error);
        next(new ApiError(500, 'Error fetching teams', error));
    }
});

module.exports = { fetchTeam };
