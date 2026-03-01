import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { requestAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const RecipientDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, accepted: 0, completed: 0, rejected: 0 });

    useEffect(() => {
        requestAPI.getAll().then(r => {
            const all = r.data.requests;
            setRequests(all.slice(0, 5));
            setStats({
                pending: all.filter(x => x.status === 'pending').length,
                accepted: all.filter(x => x.status === 'accepted').length,
                completed: all.filter(x => x.status === 'completed').length,
                rejected: all.filter(x => x.status === 'rejected').length,
            });
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Recipient Dashboard</h1>
                    <p className="page-subtitle">Welcome, {user?.name}! Track your blood requests here.</p>
                </div>

                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                    {[
                        { label: 'Pending', value: stats.pending, icon: '⏳', color: 'amber' },
                        { label: 'Accepted', value: stats.accepted, icon: '✅', color: 'green' },
                        { label: 'Completed', value: stats.completed, icon: '🏆', color: 'blue' },
                        { label: 'Rejected', value: stats.rejected, icon: '❌', color: 'crimson' },
                    ].map(s => (
                        <div className="stat-card" key={s.label}>
                            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
                        </div>
                    ))}
                </div>

                <div className="card section" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link to="/recipient/create-request" className="btn btn-primary">➕ New Blood Request</Link>
                    <Link to="/recipient/search-donors" className="btn btn-outline">🔍 Search Donors</Link>
                    <Link to="/recipient/my-requests" className="btn btn-ghost">📋 View All Requests</Link>
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Requests</h2>
                        <Link to="/recipient/my-requests" className="btn btn-ghost btn-sm">View All →</Link>
                    </div>
                    {loading ? (
                        <div className="loading-area"><div className="spinner" /></div>
                    ) : requests.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🩸</div>
                            <h3>No requests yet</h3>
                            <p>Create your first blood request above</p>
                        </div>
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
                                            <span className={`badge badge-${req.status}`}>{req.status}</span>
                                        </div>
                                    </div>
                                    <div className="request-meta">
                                        <div className="meta-item">🧪 {req.units} unit(s)</div>
                                        <div className="meta-item">📅 {new Date(req.requiredDate).toLocaleDateString('en-IN')}</div>
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

export default RecipientDashboard;
