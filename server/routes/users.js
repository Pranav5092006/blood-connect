const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { getProfile, updateProfile, toggleAvailability } = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.patch('/availability', protect, requireRole('donor'), toggleAvailability);

module.exports = router;
