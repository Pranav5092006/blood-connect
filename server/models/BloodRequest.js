const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        bloodGroup: {
            type: String,
            required: [true, 'Blood group is required'],
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        },
        hospital: {
            type: String,
            required: [true, 'Hospital name is required'],
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
        },
        units: {
            type: Number,
            required: [true, 'Units required'],
            min: [1, 'At least 1 unit required'],
            max: [10, 'Maximum 10 units'],
        },
        emergency: {
            type: Boolean,
            default: false,
        },
        requiredDate: {
            type: Date,
            required: [true, 'Required date is needed'],
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'completed'],
            default: 'pending',
        },
        acceptedDonor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
