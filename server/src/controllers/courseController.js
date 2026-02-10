const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCourses = async (req, res, next) => {
    try {
        const courses = await prisma.course.findMany();
        res.json(courses);
    } catch (error) {
        next(error);
    }
};

const createCourse = async (req, res, next) => {
    try {
        const { code, name, credits, requiresLab } = req.body;
        const course = await prisma.course.create({
            data: { code, name, credits, requiresLab }
        });
        res.status(201).json(course);
    } catch (error) {
        next(error);
    }
};

const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { code, name, credits, requiresLab } = req.body;
        const course = await prisma.course.update({
            where: { id },
            data: { code, name, credits, requiresLab }
        });
        res.json(course);
    } catch (error) {
        next(error);
    }
};

const deleteCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.course.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const bulkCreateCourses = async (req, res, next) => {
    try {
        const { courses } = req.body;

        if (!Array.isArray(courses)) {
            return res.status(400).json({ message: 'Courses must be an array' });
        }

        // Using createMany for better performance
        const result = await prisma.course.createMany({
            data: courses,
            skipDuplicates: true // Skips if code already exists (since it's unique)
        });

        res.status(201).json({
            message: `Successfully created ${result.count} courses.`,
            count: result.count
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse, bulkCreateCourses };
