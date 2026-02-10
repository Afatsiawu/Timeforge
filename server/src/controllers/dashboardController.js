const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStats = async (req, res, next) => {
    try {
        const [courseCount, instructorCount, roomCount, sessionCount] = await Promise.all([
            prisma.course.count(),
            prisma.instructor.count(),
            prisma.room.count(),
            prisma.timetableSession.count()
        ]);

        res.json({
            courses: courseCount,
            instructors: instructorCount,
            rooms: roomCount,
            sessions: sessionCount
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getStats };
