import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const socketRef = useRef(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user) {
            // Clean up when logged out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        // Connect to backend Socket.io — use VITE_API_URL in production, localhost in dev
        const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const socket = io(serverUrl, { withCredentials: true });
        socketRef.current = socket;

        socket.on('connect', () => {
            // Join personal room + role room
            socket.emit('join', { userId: user._id, role: user.role });
        });

        // Donor: listen for new blood requests
        socket.on('newRequest', (data) => {
            const msg = `🩸 New ${data.emergency ? '🚨 URGENT ' : ''}blood request: ${data.bloodGroup} in ${data.city}`;
            toast(msg, { icon: '🩸', duration: 6000, style: { background: '#1a1a1a', color: '#f1f1f1', border: '1px solid #c0392b' } });
            setNotifications(prev => [{ id: Date.now(), type: 'newRequest', text: msg, data, read: false }, ...prev.slice(0, 19)]);
        });

        // Recipient: listen for request acceptance
        socket.on('requestAccepted', (data) => {
            const contactInfo = data.donorContact ? ` Contact: ${data.donorContact}` : '';
            const msg = `✅ ${data.donorName} accepted your ${data.bloodGroup} request at ${data.hospital}!${contactInfo}`;
            toast.success(msg, { duration: 8000 });
            setNotifications(prev => [{ id: Date.now(), type: 'accepted', text: msg, data, read: false }, ...prev.slice(0, 19)]);
        });

        // Donor: listen for completion
        socket.on('requestCompleted', (data) => {
            const msg = `🏆 Your donation at ${data.hospital} (${data.bloodGroup}) was marked complete!`;
            toast.success(msg, { duration: 6000 });
            setNotifications(prev => [{ id: Date.now(), type: 'completed', text: msg, data, read: false }, ...prev.slice(0, 19)]);
        });

        return () => { socket.disconnect(); socketRef.current = null; };
    }, [user]);

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, notifications, unreadCount, markAllRead }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
