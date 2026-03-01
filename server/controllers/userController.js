const { validationResult } = require('express-validator');
const User = require('../models/User');

// @desc   Get own profile
// @route  GET /api/users/profile
const getProfile = async (req, res) => {
    res.json({ success: true, user: req.user });
};

// @desc   Update own profile
// @route  PUT /api/users/profile
const updateProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const allowedFields = ['name', 'city', 'age', 'contactNumber', 'bloodGroup', 'lastDonationDate'];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, message: 'Profile updated', user });
    } catch (error) {
        next(error);
    }
};

// @desc   Toggle donor availability
// @route  PATCH /api/users/availability
const toggleAvailability = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        user.availability = !user.availability;
        await user.save();

        res.json({
            success: true,
            message: `Availability set to ${user.availability ? 'Available' : 'Unavailable'}`,
            availability: user.availability,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, updateProfile, toggleAvailability };
