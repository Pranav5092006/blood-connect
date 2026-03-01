import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import { adminAPI } from '../../api';

const STATUSES = ['', 'pending', 'accepted', 'rejected', 'completed'];

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchRequests = () => {
        setLoading(true);
        const params = filter ? { status: filter } : {};
        adminAPI.requests(params).then(r => setRequests(r.data.requests)).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchRequests(); }, [filter]);

    const updateStatus = async (id, status) => {
        try {
            await adminAPI.updateRequestStatus(id, status);
            toast.success(`Status updated to ${status}`);
            fetchRequests();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Request Management</h1>
                    <p className="page-subtitle">Monitor and manage all blood requests</p>
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
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Blood</th>
                                    <th>Hospital</th>
                                    <th>City</th>
                                    <th>Units</th>
                                    <th>Recipient</th>
                                    <th>Emergency</th>
                                    <th>Required</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req._id}>
                                        <td><div className="blood-chip" style={{ width: 36, height: 36, fontSize: '0.72rem' }}>{req.bloodGroup}</div></td>
                                        <td style={{ fontWeight: 600, maxWidth: 150 }}>{req.hospital}</td>
                                        <td>{req.city}</td>
                                        <td>{req.units}</td>
                                        <td className="text-muted" style={{ fontSize: '0.85rem' }}>{req.recipient?.name}</td>
                                        <td>{req.emergency ? <span className="badge badge-emergency">🚨 URGENT</span> : <span className="text-muted">—</span>}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{new Date(req.requiredDate).toLocaleDateString('en-IN')}</td>
                                        <td><span className={`badge badge-${req.status}`}>{req.status}</span></td>
                                        <td>
                                            <select
                                                className="form-select"
                                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: 'var(--bg-secondary)' }}
                                                value={req.status}
                                                onChange={e => updateStatus(req._id, e.target.value)}
                                            >
                                                {['pending', 'accepted', 'rejected', 'completed'].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {requests.length === 0 && (
                            <div className="empty-state"><div className="empty-state-icon">🩸</div><h3>No requests found</h3></div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminRequests;
