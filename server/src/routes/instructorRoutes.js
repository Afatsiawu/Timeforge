const express = require('express');
const router = express.Router();
const { getInstructors, createInstructor, updateInstructor, deleteInstructor } = require('../controllers/instructorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getInstructors)
    .post(protect, authorize('ADMIN', 'COORDINATOR'), createInstructor);

router.route('/:id')
    .put(protect, authorize('ADMIN', 'COORDINATOR'), updateInstructor)
    .delete(protect, authorize('ADMIN', 'COORDINATOR'), deleteInstructor);

module.exports = router;
