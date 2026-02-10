const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const groq = require('../utils/groqClient');

/**
 * Basic CSP-based Scheduling Service with AI and Randomization
 */
class SchedulingService {
  async generateSchedule(academicYear, semester, createdById) {
    // 1. Fetch all variables (Classes)
    const classes = await prisma.class.findMany({
      where: { academicYear, semester },
      include: { course: true, instructor: { include: { availability: true } } }
    });

    // 2. Fetch all domains (Rooms and Time Slots)
    let rooms = await prisma.room.findMany();
    // Filter slots for Mon-Fri (1-5) and Operational Window (07:30 - 18:00)
    let timeSlots = await prisma.timeSlot.findMany({
      where: {
        dayOfWeek: { gte: 1, lte: 5 },
        startTime: { gte: "07:30" },
        endTime: { lte: "18:00" }
      }
    });

    if (classes.length === 0 || rooms.length === 0 || timeSlots.length === 0) {
      throw new Error('Missing data (classes, rooms, or time slots) to generate schedule');
    }

    // Try AI Generation first
    try {
      console.log('Attempting AI-powered schedule generation via Groq...');
      const aiSessions = await this.generateScheduleWithAI(classes, rooms, timeSlots, academicYear, semester, createdById);
      if (aiSessions && aiSessions.length > 0) {
        return await this.saveSessions(aiSessions, academicYear, semester);
      }
    } catch (error) {
      console.warn('AI generation failed or was bypassed, falling back to Dynamic Greedy Algorithm:', error.message);
    }

    // Fallback: Dynamic Greedy approach with Randomization
    console.log('Running Dynamic Greedy Algorithm with randomization...');
    rooms = this.shuffle(rooms);
    timeSlots = this.shuffle(timeSlots);

    const sessions = [];
    const usedResources = new Set();

    for (const classItem of classes) {
      const requiredDuration = classItem.course.credits;
      let assigned = false;

      for (const slot of timeSlots) {
        // Rule: 1 credit = 1 hour
        const slotDuration = this.calculateDuration(slot.startTime, slot.endTime);
        if (Math.abs(slotDuration - requiredDuration) > 0.1) continue;

        const isInstructorAvailable = this.checkInstructorAvailability(classItem.instructor, slot);
        if (!isInstructorAvailable) continue;

        const instructorKey = `inst-${classItem.instructorId}-${slot.id}`;
        if (usedResources.has(instructorKey)) continue;

        const cohortKey = classItem.programId && classItem.yearLevel
          ? `cohort-${classItem.programId}-${classItem.yearLevel}-${slot.id}`
          : null;

        if (cohortKey && usedResources.has(cohortKey)) continue;

        for (const room of rooms) {
          if (classItem.course.requiresLab && room.type !== 'LAB') continue;

          const roomKey = `room-${room.id}-${slot.id}`;
          if (usedResources.has(roomKey)) continue;

          sessions.push({
            classId: classItem.id,
            roomId: room.id,
            slotId: slot.id,
            academicYear,
            semester,
            createdById,
          });

          usedResources.add(instructorKey);
          usedResources.add(roomKey);
          if (cohortKey) usedResources.add(cohortKey);
          assigned = true;
          break;
        }
        if (assigned) break;
      }

      if (!assigned) {
        console.warn(`Could not find a valid slot for course: ${classItem.course.code}`);
      }
    }

    return await this.saveSessions(sessions, academicYear, semester);
  }

  async generateScheduleWithAI(classes, rooms, timeSlots, academicYear, semester, createdById) {
    const prompt = `
      You are an expert university scheduler. I need you to generate a valid, conflict-free timetable.
      
      DATA:
      - Classes: ${JSON.stringify(classes.map(c => ({ id: c.id, code: c.course.code, instructor: c.instructorId, isLab: c.course.requiresLab })))}
      - Rooms: ${JSON.stringify(rooms.map(r => ({ id: r.id, capacity: r.capacity, type: r.type })))}
      - Slots: ${JSON.stringify(timeSlots.map(s => ({ id: s.id, day: s.dayOfWeek, start: s.startTime, end: s.endTime })))}
      
      CONSTRAINTS:
      1. No instructor can be in two places at once.
      2. No room can have two classes at once.
      3. Lab courses (isLab: true) MUST be in LAB rooms.
      4. EACH CLASS DURATION MUST MATCH CREDITS: 1 credit = 1 hour.
      5. Only use slots on weekdays (Mon-Fri).
      6. All classes must start between 07:30 and 18:00.
      
      OUTPUT:
      Return ONLY a JSON array of objects with this structure:
      [{"classId": "...", "roomId": "...", "slotId": "..."}]
      No other text.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0].message.content;
    const parsed = JSON.parse(content);

    const sessionsArray = Array.isArray(parsed) ? parsed : (parsed.sessions || parsed.timetable || []);

    return sessionsArray.map(s => ({
      ...s,
      academicYear,
      semester,
      createdById
    }));
  }

  async saveSessions(sessions, academicYear, semester) {
    await prisma.timetableSession.deleteMany({
      where: { academicYear, semester }
    });

    const createdSessions = await prisma.timetableSession.createMany({
      data: sessions
    });

    return createdSessions;
  }

  shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  checkInstructorAvailability(instructor, slot) {
    if (!instructor.availability || instructor.availability.length === 0) return true;

    return instructor.availability.some(avail =>
      avail.dayOfWeek === slot.dayOfWeek &&
      avail.startTime <= slot.startTime &&
      avail.endTime >= slot.endTime &&
      avail.preference !== 'UNAVAILABLE'
    );
  }

  calculateDuration(start, end) {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return (h2 + m2 / 60) - (h1 + m1 / 60);
  }
}

module.exports = new SchedulingService();
