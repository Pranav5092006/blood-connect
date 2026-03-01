const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, requireRole } = require('../middleware/auth');
const {
    createRequest,
    getRequests,
    getRequest,
    respondToRequest,
    completeRequest,
    deleteRequest,
} = require('../controllers/requestController');

router.post(
    '/',
    protect,
    requireRole('recipient'),
    [
        body('bloodGroup').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood group required'),
        body('hospital').trim().notEmpty().withMessage('Hospital name required'),
        body('city').trim().notEmpty().withMessage('City required'),
        body('units').isInt({ min: 1, max: 10 }).withMessage('Units must be between 1 and 10'),
        body('requiredDate').isISO8601().withMessage('Valid date required'),
    ],
    createRequest
);

router.get('/', protect, getRequests);
router.get('/:id', protect, getRequest);
router.patch('/:id/respond', protect, requireRole('donor'), respondToRequest);
router.patch('/:id/complete', protect, requireRole('recipient', 'admin'), completeRequest);
router.delete('/:id', protect, deleteRequest);

module.exports = router;
