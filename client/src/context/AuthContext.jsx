import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('bc_user');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [loading, setLoading] = useState(true);

    // Stable logout reference so useEffect dependency is safe
    const logout = useCallback(() => {
        localStorage.removeItem('bc_token');
        localStorage.removeItem('bc_user');
        setUser(null);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('bc_token');
        if (!token) {
            setLoading(false);
            return;
        }

        let cancelled = false; // prevent state updates after unmount

        authAPI.me()
            .then((res) => {
                if (!cancelled) {
                    setUser(res.data.user);
                    localStorage.setItem('bc_user', JSON.stringify(res.data.user));
                }
            })
            .catch(() => {
                // Token is invalid/expired (e.g. server restarted with in-memory DB)
                if (!cancelled) logout();
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; }; // cleanup on unmount
    }, [logout]);

    const login = (token, userData) => {
        localStorage.setItem('bc_token', token);
        localStorage.setItem('bc_user', JSON.stringify(userData));
        setUser(userData);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('bc_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
