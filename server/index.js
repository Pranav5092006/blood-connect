require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const socketManager = require('./socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketManager.init(server);

// Security middleware
app.use(helmet());

// CORS — strip any trailing slash/whitespace from CLIENT_URL to prevent header errors
const allowedOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').trim().replace(/\/+$/, '');
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (origin === allowedOrigin || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Blood Connect API is running 🩸' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

// Auto-seed admin — always resets password to ensure correct bcrypt rounds
const seedAdmin = async () => {
    try {
        const User = require('./models/User');
        let admin = await User.findOne({ email: 'admin@bloodconnect.com' });
        if (!admin) {
            await User.create({ name: 'Super Admin', email: 'admin@bloodconnect.com', password: 'Admin@1234', role: 'admin' });
            console.log('✅ Admin created: admin@bloodconnect.com / Admin@1234');
        } else {
            // Always reset password to ensure it uses the current bcrypt rounds
            admin.password = 'Admin@1234';
            await admin.save();
            console.log('✅ Admin password refreshed: admin@bloodconnect.com / Admin@1234');
        }
    } catch (e) { console.error('❌ Admin seed error:', e.message); }
};

const startServer = async () => {
    await connectDB();
    await seedAdmin();

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`   Frontend: http://localhost:5173`);
        console.log(`   Socket.io: enabled`);
        console.log(`   Email:     ${process.env.EMAIL_USER}\n`);
    });
};

startServer();
