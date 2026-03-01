import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import { requestAPI } from '../../api';

const MyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchRequests = () => {
        setLoading(true);
        const params = filter ? { status: filter } : {};
        requestAPI.getAll(params).then(r => setRequests(r.data.requests)).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchRequests(); }, [filter]);

    const complete = async (id) => {
        try {
            await requestAPI.complete(id);
            toast.success('Marked as completed!');
            fetchRequests();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const cancel = async (id) => {
        if (!confirm('Cancel this request?')) return;
        try {
            await requestAPI.delete(id);
            toast.success('Request cancelled');
            fetchRequests();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">My Blood Requests</h1>
                    <p className="page-subtitle">Track the status of all your requests</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {['', 'pending', 'accepted', 'completed', 'rejected'].map(s => (
                        <button key={s || 'all'} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(s)}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-area"><div className="spinner" /></div>
                ) : requests.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No requests found</h3></div>
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
                                    {req.acceptedDonor && <div className="meta-item">💉 {req.acceptedDonor.name} ({req.acceptedDonor.bloodGroup})</div>}
                                    {req.acceptedDonor && <div className="meta-item">📞 {req.acceptedDonor.contactNumber || 'N/A'}</div>}
                                </div>
                                <div className="request-card-footer">
                                    {req.status === 'accepted' && (
                                        <button className="btn btn-success btn-sm" onClick={() => complete(req._id)}>✅ Mark Complete</button>
                                    )}
                                    {req.status === 'pending' && (
                                        <button className="btn btn-danger btn-sm" onClick={() => cancel(req._id)}>🗑 Cancel</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyRequests;
