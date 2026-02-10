const express = require('express');
const router = express.Router();
const { getRooms, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getRooms)
    .post(protect, authorize('ADMIN', 'COORDINATOR'), createRoom);

router.route('/:id')
    .put(protect, authorize('ADMIN', 'COORDINATOR'), updateRoom)
    .delete(protect, authorize('ADMIN', 'COORDINATOR'), deleteRoom);

module.exports = router;
