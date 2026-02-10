const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getOfferings = async (req, res, next) => {
    try {
        const offerings = await prisma.courseOffering.findMany({
            include: {
                course: true,
                instructor: { include: { user: true } },
                program: true
            }
        });
        res.json(offerings);
    } catch (error) {
        next(error);
    }
};

const createOffering = async (req, res, next) => {
    try {
        const { courseId, instructorId, academicYear, semester, maxEnrollment, section, programId, yearLevel } = req.body;
        const offering = await prisma.courseOffering.create({
            data: { courseId, instructorId, academicYear, semester, maxEnrollment, section, programId, yearLevel }
        });
        res.status(201).json(offering);
    } catch (error) {
        next(error);
    }
};

const deleteOffering = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.courseOffering.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = { getOfferings, createOffering, deleteOffering };
