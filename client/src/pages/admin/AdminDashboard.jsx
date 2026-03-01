import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { adminAPI } from '../../api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminAPI.stats().then(r => setStats(r.data.stats)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Blood Connect — System Overview</p>
                </div>

                {loading ? (
                    <div className="loading-area"><div className="spinner" /></div>
                ) : (
                    <>
                        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                            {[
                                { label: 'Total Donors', value: stats?.totalDonors || 0, icon: '💉', color: 'crimson' },
                                { label: 'Total Recipients', value: stats?.totalRecipients || 0, icon: '🏥', color: 'blue' },
                                { label: 'Active Requests', value: stats?.activeRequests || 0, icon: '⏳', color: 'amber' },
                                { label: 'Donations Done', value: stats?.completedDonations || 0, icon: '✅', color: 'green' },
                            ].map(s => (
                                <div className="stat-card" key={s.label}>
                                    <div className={`stat-icon ${s.color}`} style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                                    <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
                                </div>
                            ))}
                        </div>

                        {stats?.emergencyRequests > 0 && (
                            <div className="card section" style={{ borderColor: 'rgba(192,57,43,0.4)', background: 'rgba(192,57,43,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🚨</span>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{stats.emergencyRequests} Emergency Request{stats.emergencyRequests > 1 ? 's' : ''} Pending</div>
                                        <div className="text-muted text-sm">Immediate attention required</div>
                                    </div>
                                </div>
                                <Link to="/admin/requests" className="btn btn-danger btn-sm">View Now</Link>
                            </div>
                        )}

                        <div className="two-col" style={{ marginTop: '1.5rem' }}>
                            <div className="card">
                                <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <Link to="/admin/users" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>👥 Manage Users</Link>
                                    <Link to="/admin/requests" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>🩸 Manage Requests</Link>
                                    <Link to="/admin/users?role=donor" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>💉 View All Donors</Link>
                                    <Link to="/admin/users?role=recipient" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>🏥 View All Recipients</Link>
                                </div>
                            </div>
                            <div className="card">
                                <h3 style={{ marginBottom: '1rem' }}>System Health</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {[
                                        { label: 'Donor-to-Recipient Ratio', value: stats?.totalDonors && stats?.totalRecipients ? `${(stats.totalDonors / Math.max(stats.totalRecipients, 1)).toFixed(1)}:1` : 'N/A', color: 'var(--success)' },
                                        { label: 'Active Request Volume', value: stats?.activeRequests || 0, color: 'var(--warning)' },
                                        { label: 'Emergency Pending', value: stats?.emergencyRequests || 0, color: stats?.emergencyRequests > 0 ? 'var(--crimson-light)' : 'var(--success)' },
                                    ].map(item => (
                                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                            <span className="text-muted text-sm">{item.label}</span>
                                            <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
