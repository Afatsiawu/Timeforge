const express = require('express');
const router = express.Router();
const { generateTimetable, getSessions } = require('../controllers/schedulingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getSessions);
router.post('/generate', protect, authorize('ADMIN', 'COORDINATOR'), generateTimetable);

module.exports = router;
