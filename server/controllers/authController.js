const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/emailService');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

        const { name, email, password, role, bloodGroup, city, age, contactNumber } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

        const user = await User.create({
            name, email, password,
            role: role === 'admin' ? 'recipient' : role,
            bloodGroup: bloodGroup === '' ? undefined : bloodGroup,
            city, age, contactNumber,
        });

        const token = generateToken(user._id);
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, bloodGroup: user.bloodGroup, city: user.city, availability: user.availability },
        });
    } catch (error) { next(error); }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
        if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account blocked. Contact admin.' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const token = generateToken(user._id);
        res.json({
            success: true, message: 'Login successful', token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, bloodGroup: user.bloodGroup, city: user.city, availability: user.availability },
        });
    } catch (error) { next(error); }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => res.json({ success: true, user: req.user });

// @desc    Forgot password — sends reset email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const user = await User.findOne({ email });
        // Always return success to prevent email enumeration
        if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });

        // Generate a secure random token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
        await user.save();

        try {
            await sendPasswordResetEmail(user, rawToken);
            console.log(`✅ Reset email sent to ${user.email} | Link: ${process.env.CLIENT_URL}/reset-password/${rawToken}`);
        } catch (emailErr) {
            console.error('Reset email error:', emailErr.message);
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            return res.status(500).json({ success: false, message: 'Could not send reset email. Check email config.' });
        }

        res.json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (error) { next(error); }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });

        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        const token = generateToken(user._id);
        res.json({
            success: true, message: 'Password reset successfully! You are now logged in.',
            token,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, bloodGroup: user.bloodGroup, city: user.city, availability: user.availability },
        });
    } catch (error) { next(error); }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
