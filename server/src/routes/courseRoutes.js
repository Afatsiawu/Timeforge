const express = require('express');
const router = express.Router();
const { getCourses, createCourse, updateCourse, deleteCourse, bulkCreateCourses } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCourses)
    .post(protect, authorize('ADMIN', 'COORDINATOR'), createCourse);

router.post('/bulk', protect, authorize('ADMIN', 'COORDINATOR'), bulkCreateCourses);

router.route('/:id')
    .put(protect, authorize('ADMIN', 'COORDINATOR'), updateCourse)
    .delete(protect, authorize('ADMIN', 'COORDINATOR'), deleteCourse);

module.exports = router;
