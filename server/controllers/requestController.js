const BloodRequest = require('../models/BloodRequest');
const DonationHistory = require('../models/DonationHistory');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { sendRequestAcceptedEmail, sendDonationCompleteEmail } = require('../utils/emailService');

// Get the shared Socket.io instance (set in index.js after server start)
const getIO = () => {
    try { return require('../socket').getIO(); } catch { return null; }
};

// @desc   Create a blood request (recipient)
// @route  POST /api/requests
const createRequest = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

        const { bloodGroup, hospital, city, units, emergency, requiredDate, notes } = req.body;
        const request = await BloodRequest.create({
            recipient: req.user._id,
            bloodGroup, hospital, city, units,
            emergency: emergency || false,
            requiredDate, notes,
        });

        const populated = await BloodRequest.findById(request._id).populate('recipient', 'name email city');

        // Real-time: notify all available donors about the new request
        const io = getIO();
        if (io) {
            io.to('donors').emit('newRequest', {
                _id: request._id,
                bloodGroup: request.bloodGroup,
                hospital: request.hospital,
                city: request.city,
                units: request.units,
                emergency: request.emergency,
                recipientName: req.user.name,
            });
        }

        res.status(201).json({ success: true, message: 'Blood request created', request: populated });
    } catch (error) { next(error); }
};

// @desc   Get blood requests (role-based)
// @route  GET /api/requests
const getRequests = async (req, res, next) => {
    try {
        let query = {};
        const { status, bloodGroup, city, emergency } = req.query;

        if (req.user.role === 'recipient') query.recipient = req.user._id;

        if (status) query.status = status;
        if (bloodGroup) query.bloodGroup = bloodGroup;
        if (city) query.city = new RegExp(city, 'i');
        if (emergency === 'true') query.emergency = true;

        const requests = await BloodRequest.find(query)
            .populate('recipient', 'name email city contactNumber')
            .populate('acceptedDonor', 'name email contactNumber bloodGroup')
            .sort({ emergency: -1, createdAt: -1 });

        res.json({ success: true, count: requests.length, requests });
    } catch (error) { next(error); }
};

// @desc   Get single request
// @route  GET /api/requests/:id
const getRequest = async (req, res, next) => {
    try {
        const request = await BloodRequest.findById(req.params.id)
            .populate('recipient', 'name email city contactNumber')
            .populate('acceptedDonor', 'name email contactNumber bloodGroup');

        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        res.json({ success: true, request });
    } catch (error) { next(error); }
};

// @desc   Donor responds to a request (accept/reject)
// @route  PATCH /api/requests/:id/respond
const respondToRequest = async (req, res, next) => {
    try {
        const { action } = req.body;
        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Action must be accept or reject' });
        }

        const request = await BloodRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request is no longer pending' });

        if (action === 'accept') {
            request.status = 'accepted';
            request.acceptedDonor = req.user._id;
            await User.findByIdAndUpdate(req.user._id, { lastDonationDate: new Date() });
        } else {
            request.status = 'rejected';
        }
        await request.save();

        const populated = await BloodRequest.findById(request._id)
            .populate('recipient', 'name email city contactNumber')
            .populate('acceptedDonor', 'name email contactNumber bloodGroup');

        // Email + real-time notification on accept
        if (action === 'accept') {
            const io = getIO();
            if (io) {
                io.to(`user:${request.recipient.toString()}`).emit('requestAccepted', {
                    requestId: request._id,
                    bloodGroup: request.bloodGroup,
                    hospital: request.hospital,
                    donorName: req.user.name,
                });
            }
            // Send email silently (don't block response)
            sendRequestAcceptedEmail(populated.recipient, populated.acceptedDonor, request)
                .catch(err => console.error('Accept email error:', err.message));
        }

        res.json({ success: true, message: `Request ${action}ed`, request: populated });
    } catch (error) { next(error); }
};

// @desc   Mark request completed
// @route  PATCH /api/requests/:id/complete
const completeRequest = async (req, res, next) => {
    try {
        const request = await BloodRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

        if (request.recipient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (request.status !== 'accepted') {
            return res.status(400).json({ success: false, message: 'Request must be accepted first' });
        }

        request.status = 'completed';
        await request.save();

        if (request.acceptedDonor) {
            await DonationHistory.create({ donor: request.acceptedDonor, request: request._id, donatedAt: new Date() });

            const io = getIO();
            if (io) {
                io.to(`user:${request.acceptedDonor.toString()}`).emit('requestCompleted', {
                    requestId: request._id,
                    bloodGroup: request.bloodGroup,
                    hospital: request.hospital,
                });
            }

            const donor = await User.findById(request.acceptedDonor);
            sendDonationCompleteEmail(donor, request)
                .catch(err => console.error('Complete email error:', err.message));
        }

        res.json({ success: true, message: 'Request marked as completed', request });
    } catch (error) { next(error); }
};

// @desc   Delete / cancel a request
// @route  DELETE /api/requests/:id
const deleteRequest = async (req, res, next) => {
    try {
        const request = await BloodRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

        if (request.recipient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await request.deleteOne();
        res.json({ success: true, message: 'Request deleted' });
    } catch (error) { next(error); }
};

module.exports = { createRequest, getRequests, getRequest, respondToRequest, completeRequest, deleteRequest };
