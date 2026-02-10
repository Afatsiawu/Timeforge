const express = require('express');
const router = express.Router();
const { getClasses, createClass, deleteClass } = require('../controllers/classController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getClasses)
    .post(protect, authorize('ADMIN', 'COORDINATOR'), createClass);

router.route('/:id')
    .delete(protect, authorize('ADMIN', 'COORDINATOR'), deleteClass);

module.exports = router;
