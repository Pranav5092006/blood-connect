const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const DonationHistory = require('../models/DonationHistory');

// @desc   Get admin dashboard statistics
// @route  GET /api/admin/stats
const getStats = async (req, res, next) => {
    try {
        const [totalDonors, totalRecipients, activeRequests, completedDonations, emergencyRequests] = await Promise.all([
            User.countDocuments({ role: 'donor' }),
            User.countDocuments({ role: 'recipient' }),
            BloodRequest.countDocuments({ status: { $in: ['pending', 'accepted'] } }),
            DonationHistory.countDocuments(),
            BloodRequest.countDocuments({ emergency: true, status: 'pending' }),
        ]);

        res.json({
            success: true,
            stats: {
                totalDonors,
                totalRecipients,
                activeRequests,
                completedDonations,
                emergencyRequests,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Get all users
// @route  GET /api/admin/users
const getAllUsers = async (req, res, next) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;
        const query = role ? { role } : {};
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await User.countDocuments(query);

        res.json({ success: true, total, page: Number(page), users });
    } catch (error) {
        next(error);
    }
};

// @desc   Block or unblock a user
// @route  PATCH /api/admin/users/:id/block
const toggleBlockUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot block admin' });

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            isBlocked: user.isBlocked,
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Delete a user
// @route  DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });

        await user.deleteOne();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc   Get all blood requests (admin view)
// @route  GET /api/admin/requests
const getAllRequests = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = status ? { status } : {};

        const requests = await BloodRequest.find(query)
            .populate('recipient', 'name email city')
            .populate('acceptedDonor', 'name email')
            .sort({ emergency: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await BloodRequest.countDocuments(query);

        res.json({ success: true, total, page: Number(page), requests });
    } catch (error) {
        next(error);
    }
};

// @desc   Update request status (admin)
// @route  PATCH /api/admin/requests/:id/status
const updateRequestStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const request = await BloodRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

        res.json({ success: true, message: 'Request status updated', request });
    } catch (error) {
        next(error);
    }
};

module.exports = { getStats, getAllUsers, toggleBlockUser, deleteUser, getAllRequests, updateRequestStatus };
