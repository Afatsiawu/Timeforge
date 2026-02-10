const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPrograms = async (req, res, next) => {
    try {
        const programs = await prisma.program.findMany();
        res.json(programs);
    } catch (error) {
        next(error);
    }
};

const createProgram = async (req, res, next) => {
    try {
        const { name } = req.body;
        const program = await prisma.program.create({
            data: { name }
        });
        res.status(201).json(program);
    } catch (error) {
        next(error);
    }
};

const updateProgram = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const program = await prisma.program.update({
            where: { id },
            data: { name }
        });
        res.json(program);
    } catch (error) {
        next(error);
    }
};

const deleteProgram = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.program.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = { getPrograms, createProgram, updateProgram, deleteProgram };
