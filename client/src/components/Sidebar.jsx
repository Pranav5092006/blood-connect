import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DonorNav = () => (
    <>
        <span className="nav-section-title">Donor</span>
        <NavLink to="/donor/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            🏠 <span>Dashboard</span>
        </NavLink>
        <NavLink to="/donor/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            👤 <span>My Profile</span>
        </NavLink>
        <NavLink to="/donor/requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            🩸 <span>Blood Requests</span>
        </NavLink>
        <NavLink to="/donor/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            📋 <span>Donation History</span>
        </NavLink>
    </>
);

const RecipientNav = () => (
    <>
        <span className="nav-section-title">Recipient</span>
        <NavLink to="/recipient/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            🏠 <span>Dashboard</span>
        </NavLink>
        <NavLink to="/recipient/create-request" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            ➕ <span>New Request</span>
        </NavLink>
        <NavLink to="/recipient/my-requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            📋 <span>My Requests</span>
        </NavLink>
        <NavLink to="/recipient/search-donors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            🔍 <span>Find Donors</span>
        </NavLink>
    </>
);

const AdminNav = () => (
    <>
        <span className="nav-section-title">Admin</span>
        <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            📊 <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            👥 <span>Users</span>
        </NavLink>
        <NavLink to="/admin/requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            🩸 <span>All Requests</span>
        </NavLink>
    </>
);

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="sidebar">
            <a href="/" className="sidebar-logo">
                <div className="sidebar-logo-icon">🩸</div>
                <span className="sidebar-logo-text">Blood Connect</span>
            </a>

            <nav className="sidebar-nav">
                {user?.role === 'donor' && <DonorNav />}
                {user?.role === 'recipient' && <RecipientNav />}
                {user?.role === 'admin' && <AdminNav />}
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ padding: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
                </div>
                <button className="btn btn-ghost w-full" onClick={handleLogout} style={{ borderRadius: 'var(--radius-sm)', justifyContent: 'flex-start', gap: '0.6rem' }}>
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
