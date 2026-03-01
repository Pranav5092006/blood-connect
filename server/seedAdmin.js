require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
    await connectDB();

    const adminEmail = 'admin@bloodconnect.com';
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
        console.log('✅ Admin already exists:', adminEmail);
        process.exit(0);
    }

    await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'Admin@1234',
        role: 'admin',
    });

    console.log('✅ Admin seeded successfully!');
    console.log('   Email: admin@bloodconnect.com');
    console.log('   Password: Admin@1234');
    process.exit(0);
};

seedAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
});
