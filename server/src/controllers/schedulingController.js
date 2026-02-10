const { PrismaClient } = require('@prisma/client');
const schedulingService = require('../services/schedulingService');
const prisma = new PrismaClient();

const getSessions = async (req, res, next) => {
    try {
        const { academicYear, semester } = req.query;
        const sessions = await prisma.timetableSession.findMany({
            where: {
                ...(academicYear && { academicYear }),
                ...(semester && { semester })
            },
            include: {
                class: {
                    include: {
                        course: true,
                        instructor: { include: { user: true } },
                        program: true
                    }
                },
                room: true,
                slot: true
            }
        });
        res.json(sessions);
    } catch (error) {
        next(error);
    }
};

const generateTimetable = async (req, res, next) => {
    try {
        const { academicYear, semester } = req.body;
        const result = await schedulingService.generateSchedule(academicYear, semester, req.user.id);
        res.json({ message: 'Timetable generated successfully', result });
    } catch (error) {
        next(error);
    }
};

module.exports = { generateTimetable, getSessions };
