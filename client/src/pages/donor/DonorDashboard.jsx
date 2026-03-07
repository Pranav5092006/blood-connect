import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import { requestAPI, userAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const BadgeStatus = ({ s }) => (
    <span className={`badge badge-${s}`}>{s}</span>
);

const DonorDashboard = () => {
    const { user, updateUser } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        requestAPI.getAll({ status: 'pending' }).then(r => {
            setRequests(r.data.requests.slice(0, 6));
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const toggleAvail = async () => {
        setToggling(true);
        try {
            const { data } = await userAPI.toggleAvailability();
            updateUser({ ...user, availability: data.availability });
            toast.success(data.message);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); } finally { setToggling(false); }
    };

    const respond = async (id, action) => {
        try {
            await requestAPI.respond(id, action);
            setRequests(prev => prev.filter(r => r._id !== id));
            toast.success(`Request ${action}ed!`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Donor Dashboard</h1>
                    <p className="page-subtitle">Welcome back, {user?.name}!</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon crimson">🩸</div>
                        <div>
                            <div className="stat-value">{user?.bloodGroup || '—'}</div>
                            <div className="stat-label">Blood Group</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">📍</div>
                        <div>
                            <div className="stat-value" style={{ fontSize: '1.25rem' }}>{user?.city || '—'}</div>
                            <div className="stat-label">Location</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue">📅</div>
                        <div>
                            <div className="stat-value" style={{ fontSize: '1rem' }}>
                                {user?.lastDonationDate ? new Date(user.lastDonationDate).toLocaleDateString('en-IN') : 'Never'}
                            </div>
                            <div className="stat-label">Last Donation</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon amber">✅</div>
                        <div>
                            <div className="stat-value" style={{ fontSize: '1rem', color: user?.availability ? 'var(--success)' : 'var(--text-muted)' }}>
                                {user?.availability ? 'Available' : 'Unavailable'}
                            </div>
                            <div className="stat-label">Status</div>
                        </div>
                    </div>
                </div>

                {/* Availability Toggle */}
                <div className="card section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ marginBottom: '0.25rem' }}>Donation Availability</h3>
                        <p className="text-muted text-sm">Toggle to let recipients know you're available to donate</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge ${user?.availability ? 'badge-available' : 'badge-unavailable'}`}>
                            {user?.availability ? 'Available' : 'Unavailable'}
                        </span>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={user?.availability || false} onChange={toggleAvail} disabled={toggling} />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                </div>

                {/* Pending requests */}
                <div className="section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 className="page-title" style={{ fontSize: '1.25rem' }}>Open Blood Requests</h2>
                        <Link to="/donor/requests" className="btn btn-ghost btn-sm">View All →</Link>
                    </div>

                    {loading ? (
                        <div className="loading-area"><div className="spinner" /></div>
                    ) : requests.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">🩸</div><h3>No pending requests</h3><p>Check back later</p></div>
                    ) : (
                        <div className="cards-grid">
                            {requests.map(req => (
                                <div key={req._id} className={`request-card ${req.emergency ? 'emergency' : ''}`}>
                                    <div className="request-card-header">
                                        <div className="request-info">
                                            <div className="blood-chip">{req.bloodGroup}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{req.hospital}</div>
                                                <div className="text-muted text-sm">{req.city}</div>
                                            </div>
                                        </div>
                                        <div className="request-card-badges">
                                            {req.emergency && <span className="badge badge-emergency">🚨 URGENT</span>}
                                            <BadgeStatus s={req.status} />
                                        </div>
                                    </div>
                                    <div className="request-meta">
                                        <div className="meta-item">🧪 {req.units} unit{req.units > 1 ? 's' : ''}</div>
                                        <div className="meta-item">📅 {new Date(req.requiredDate).toLocaleDateString('en-IN')}</div>
                                        <div className="meta-item">👤 {req.recipient?.name}</div>
                                        <div className="meta-item">📞 {req.recipient?.contactNumber || 'N/A'}</div>
                                    </div>
                                    <div className="request-card-footer">
                                        <button className="btn btn-success btn-sm" onClick={() => respond(req._id, 'accept')}>✅ Accept</button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => respond(req._id, 'reject')}>❌ Decline</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DonorDashboard;
