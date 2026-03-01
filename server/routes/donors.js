const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { searchDonors, getDonorHistory } = require('../controllers/donorController');

router.get('/search', protect, searchDonors);
router.get('/history', protect, requireRole('donor'), getDonorHistory);

module.exports = router;
