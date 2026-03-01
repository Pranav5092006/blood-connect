import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_REDIRECTS = {
    admin: '/admin/dashboard',
    donor: '/donor/dashboard',
    recipient: '/recipient/dashboard',
};

export const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-area" style={{ minHeight: '100vh' }}>
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    if (roles && !roles.includes(user.role)) {
        return <Navigate to={ROLE_REDIRECTS[user.role] || '/'} replace />;
    }
    return children;
};

export const GuestRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to={ROLE_REDIRECTS[user.role] || '/'} replace />;
    return children;
};
