const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDepartments = async (req, res, next) => {
    try {
        const departments = await prisma.department.findMany({
            include: { Programs: true }
        });
        res.json(departments);
    } catch (error) {
        next(error);
    }
};

const createDepartment = async (req, res, next) => {
    try {
        const { code, name, building } = req.body;
        const department = await prisma.department.create({
            data: { code, name, building }
        });
        res.status(201).json(department);
    } catch (error) {
        next(error);
    }
};

module.exports = { getDepartments, createDepartment };
