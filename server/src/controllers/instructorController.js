const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const getInstructors = async (req, res, next) => {
  try {
    const instructors = await prisma.instructor.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            username: true
          }
        }
      }
    });
    res.json(instructors);
  } catch (error) {
    next(error);
  }
};

const createInstructor = async (req, res, next) => {
  try {
    const {
      email,
      firstName,
      lastName,
      qualifications,
      maxHoursPerWeek,
      employmentType
    } = req.body;

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Default123!', salt); // Default password for new instructors

      user = await prisma.user.create({
        data: {
          email,
          username: email.split('@')[0],
          passwordHash,
          firstName,
          lastName,
          role: 'INSTRUCTOR'
        }
      });
    }

    // Convert qualifications to string if it's an array
    const qualificationsStr = Array.isArray(qualifications) ? qualifications.join(',') : qualifications;

    const instructor = await prisma.instructor.create({
      data: {
        userId: user.id,
        qualifications: qualificationsStr || '',
        maxHoursPerWeek: maxHoursPerWeek || 40,
        employmentType: employmentType || 'FULL_TIME'
      },
      include: { user: true }
    });

    res.status(201).json(instructor);
  } catch (error) {
    next(error);
  }
};

const updateInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, qualifications, ...instructorData } = req.body;

    const data = { ...instructorData };
    if (qualifications !== undefined) {
      data.qualifications = Array.isArray(qualifications) ? qualifications.join(',') : qualifications;
    }

    const instructor = await prisma.instructor.update({
      where: { id },
      data,
      include: { user: true }
    });

    if (firstName || lastName) {
      await prisma.user.update({
        where: { id: instructor.userId },
        data: { firstName, lastName }
      });
    }

    const updated = await prisma.instructor.findUnique({
      where: { id },
      include: { user: true }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.instructor.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { getInstructors, createInstructor, updateInstructor, deleteInstructor };
