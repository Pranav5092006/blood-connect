// Socket.io singleton — initialized in index.js, imported by controllers
let _io = null;

const init = (server) => {
    const { Server } = require('socket.io');
    _io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
        },
    });

    _io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // Client sends their userId + role after login
        socket.on('join', ({ userId, role }) => {
            // Join a personal room for direct notifications
            if (userId) socket.join(`user:${userId}`);
            // Donors join the shared 'donors' room to receive new request broadcasts
            if (role === 'donor') socket.join('donors');
            console.log(`   → ${role} ${userId} joined rooms`);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    return _io;
};

const getIO = () => {
    if (!_io) throw new Error('Socket.io not initialized');
    return _io;
};

module.exports = { init, getIO };
