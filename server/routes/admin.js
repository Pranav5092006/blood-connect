const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
    getStats,
    getAllUsers,
    toggleBlockUser,
    deleteUser,
    getAllRequests,
    updateRequestStatus,
} = require('../controllers/adminController');

router.use(protect, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);
router.get('/requests', getAllRequests);
router.patch('/requests/:id/status', updateRequestStatus);

module.exports = router;
