const User = require('../models/User');

// @desc   Search available donors by blood group and city
// @route  GET /api/donors/search
const searchDonors = async (req, res, next) => {
    try {
        const { bloodGroup, city } = req.query;

        const query = {
            role: 'donor',
            availability: true,
            isBlocked: false,
        };

        if (bloodGroup) query.bloodGroup = bloodGroup;
        if (city) query.city = new RegExp(city, 'i');

        const donors = await User.find(query).select(
            'name bloodGroup city contactNumber age lastDonationDate availability'
        );

        res.json({ success: true, count: donors.length, donors });
    } catch (error) {
        next(error);
    }
};

// @desc   Get donor donation history
// @route  GET /api/donors/history
const getDonorHistory = async (req, res, next) => {
    try {
        const DonationHistory = require('../models/DonationHistory');
        const history = await DonationHistory.find({ donor: req.user._id })
            .populate('request', 'bloodGroup hospital city units status requiredDate')
            .sort({ donatedAt: -1 });

        res.json({ success: true, count: history.length, history });
    } catch (error) {
        next(error);
    }
};

module.exports = { searchDonors, getDonorHistory };
