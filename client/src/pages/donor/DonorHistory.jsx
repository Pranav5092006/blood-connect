import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { donorAPI } from '../../api';

const DonorHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        donorAPI.history().then(r => setHistory(r.data.history)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Donation History</h1>
                    <p className="page-subtitle">Your completed donations — every drop counts</p>
                </div>

                {loading ? (
                    <div className="loading-area"><div className="spinner" /></div>
                ) : history.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>No donations yet</h3>
                        <p>Accept blood requests to start your giving journey!</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Blood Group</th>
                                    <th>Hospital</th>
                                    <th>City</th>
                                    <th>Units</th>
                                    <th>Donated On</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(h => (
                                    <tr key={h._id}>
                                        <td><div className="blood-chip" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>{h.request?.bloodGroup}</div></td>
                                        <td>{h.request?.hospital}</td>
                                        <td>{h.request?.city}</td>
                                        <td>{h.request?.units}</td>
                                        <td>{new Date(h.donatedAt).toLocaleDateString('en-IN')}</td>
                                        <td><span className="badge badge-completed">completed</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DonorHistory;
