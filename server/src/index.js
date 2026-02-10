require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const roomRoutes = require('./routes/roomRoutes');
const classRoutes = require('./routes/classRoutes');
const programRoutes = require('./routes/programRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const schedulingRoutes = require('./routes/schedulingRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/scheduling', schedulingRoutes);

app.use(errorHandler);

const seedDatabase = async () => {
    try {
        // Seed Admin User
        const userCount = await prisma.user.count();
        if (userCount === 0) {
            console.log('Seeding default admin user...');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('admin123', salt);
            await prisma.user.create({
                data: {
                    email: 'admin@timeforge.com',
                    username: 'admin',
                    passwordHash,
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'ADMIN'
                }
            });
            console.log('Admin user seeded!');
        }

        // Seed Time Slots
        const count = await prisma.timeSlot.count();
        if (count === 0) {
            console.log('Seeding default time slots...');
            const days = [1, 2, 3, 4, 5]; // Mon-Fri
            const slots = [];
            for (const day of days) {
                // Regular slots
                slots.push({ dayOfWeek: day, startTime: '08:00', endTime: '10:00', type: 'THEORY' });
                slots.push({ dayOfWeek: day, startTime: '10:00', endTime: '12:00', type: 'THEORY' });
                slots.push({ dayOfWeek: day, startTime: '13:00', endTime: '15:00', type: 'THEORY' });
                slots.push({ dayOfWeek: day, startTime: '15:00', endTime: '17:00', type: 'THEORY' });
                // Lab slots
                slots.push({ dayOfWeek: day, startTime: '08:00', endTime: '11:00', type: 'LAB' });
                slots.push({ dayOfWeek: day, startTime: '14:00', endTime: '17:00', type: 'LAB' });
            }
            await prisma.timeSlot.createMany({ data: slots });
            console.log('Time slots seeded!');
        }
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

const server = app.listen(PORT, async () => {
    await seedDatabase();
    console.log(`Server is running on port ${PORT}`);
});

// Heartbeat to keep process alive and debug
setInterval(() => {
    console.log('Server heartbeat - process is alive');
}, 30000);

process.on('exit', (code) => {
    console.log(`Process about to exit with code: ${code}`);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

module.exports = { app, prisma };
