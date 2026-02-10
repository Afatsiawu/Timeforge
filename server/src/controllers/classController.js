const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getClasses = async (req, res, next) => {
    try {
        const classes = await prisma.class.findMany({
            include: {
                course: true,
                instructor: { include: { user: true } },
                program: true
            }
        });
        res.json(classes);
    } catch (error) {
        next(error);
    }
};

const createClass = async (req, res, next) => {
    try {
        const { courseId, instructorId, academicYear, semester, programId, yearLevel } = req.body;
        const classItem = await prisma.class.create({
            data: { courseId, instructorId, academicYear, semester, programId, yearLevel }
        });
        res.status(201).json(classItem);
    } catch (error) {
        next(error);
    }
};

const deleteClass = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.class.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = { getClasses, createClass, deleteClass };
