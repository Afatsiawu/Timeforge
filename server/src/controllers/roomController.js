const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getRooms = async (req, res, next) => {
    try {
        const rooms = await prisma.room.findMany();
        // Convert facilities back to array for frontend
        const formattedRooms = rooms.map(room => ({
            ...room,
            facilities: room.facilities ? room.facilities.split(',').filter(f => f !== '') : []
        }));
        res.json(formattedRooms);
    } catch (error) {
        next(error);
    }
};

const createRoom = async (req, res, next) => {
    try {
        const { number, building, capacity, type, facilities } = req.body;
        // Join facilities to string for SQLite
        const facilitiesStr = Array.isArray(facilities) ? facilities.join(',') : facilities;

        const room = await prisma.room.create({
            data: { number, building, capacity, type, facilities: facilitiesStr }
        });

        // Return with facilities as array
        res.status(201).json({
            ...room,
            facilities: room.facilities ? room.facilities.split(',').filter(f => f !== '') : []
        });
    } catch (error) {
        next(error);
    }
};

const updateRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { facilities, ...roomData } = req.body;

        const data = { ...roomData };
        if (facilities !== undefined) {
            data.facilities = Array.isArray(facilities) ? facilities.join(',') : facilities;
        }

        const room = await prisma.room.update({
            where: { id },
            data
        });

        res.json({
            ...room,
            facilities: room.facilities ? room.facilities.split(',').filter(f => f !== '') : []
        });
    } catch (error) {
        next(error);
    }
};

const deleteRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.room.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = { getRooms, createRoom, updateRoom, deleteRoom };
