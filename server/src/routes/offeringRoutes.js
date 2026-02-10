const express = require('express');
const router = express.Router();
const { getOfferings, createOffering, deleteOffering } = require('../controllers/offeringController');

router.get('/', getOfferings);
router.post('/', createOffering);
router.delete('/:id', deleteOffering);

module.exports = router;
