const mongoose = require('mongoose');

const donationHistorySchema = new mongoose.Schema(
    {
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        request: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BloodRequest',
            required: true,
        },
        donatedAt: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('DonationHistory', donationHistorySchema);
