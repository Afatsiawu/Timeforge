const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, programController.getPrograms);
router.post('/', protect, authorize('ADMIN', 'COORDINATOR'), programController.createProgram);
router.put('/:id', protect, authorize('ADMIN', 'COORDINATOR'), programController.updateProgram);
router.delete('/:id', protect, authorize('ADMIN', 'COORDINATOR'), programController.deleteProgram);

module.exports = router;
