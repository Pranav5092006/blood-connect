import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import { requestAPI } from '../../api';

const STATUSES = ['', 'pending', 'accepted', 'rejected', 'completed'];

const DonorRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    const fetch = () => {
        setLoading(true);
        const params = {};
        if (filter) params.status = filter;
        requestAPI.getAll(params).then(r => setRequests(r.data.requests)).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, [filter]);

    const respond = async (id, action) => {
        try {
            await requestAPI.respond(id, action);
            toast.success(`Request ${action}ed!`);
            fetch();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Blood Requests</h1>
                    <p className="page-subtitle">Browse and respond to blood donation requests</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {STATUSES.map(s => (
                        <button key={s || 'all'} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(s)}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-area"><div className="spinner" /></div>
                ) : requests.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">🩸</div><h3>No requests found</h3></div>
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
                                    <div className="meta-item">👤 {req.recipient?.name}</div>
                                    <div className="meta-item">📞 {req.recipient?.contactNumber || 'N/A'}</div>
                                </div>
                                {req.status === 'pending' && (
                                    <div className="request-card-footer">
                                        <button className="btn btn-success btn-sm" onClick={() => respond(req._id, 'accept')}>✅ Accept</button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => respond(req._id, 'reject')}>❌ Decline</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DonorRequests;
