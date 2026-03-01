import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { donorAPI } from '../../api';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const SearchDonors = () => {
    const [filters, setFilters] = useState({ bloodGroup: '', city: '' });
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handle = (e) => setFilters(f => ({ ...f, [e.target.name]: e.target.value }));

    const search = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const params = {};
            if (filters.bloodGroup) params.bloodGroup = filters.bloodGroup;
            if (filters.city) params.city = filters.city;
            const { data } = await donorAPI.search(params);
            setDonors(data.donors);
            if (data.donors.length === 0) toast.error('No donors found for these filters');
        } catch { toast.error('Search failed'); } finally { setLoading(false); }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Find Blood Donors</h1>
                    <p className="page-subtitle">Search for available donors by blood group and city</p>
                </div>

                <div className="card section" style={{ maxWidth: 600 }}>
                    <form onSubmit={search} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                            <label className="form-label">Blood Group</label>
                            <select className="form-select" name="bloodGroup" value={filters.bloodGroup} onChange={handle}>
                                <option value="">Any</option>
                                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 2, minWidth: 180 }}>
                            <label className="form-label">City</label>
                            <input className="form-input" name="city" value={filters.city} onChange={handle} placeholder="e.g. Mumbai" />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? '⏳' : '🔍'} Search
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="loading-area"><div className="spinner" /></div>
                ) : donors.length > 0 ? (
                    <div className="cards-grid">
                        {donors.map(d => (
                            <div key={d._id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div className="blood-chip blood-chip-lg">{d.bloodGroup}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{d.name}</div>
                                    <div className="text-muted text-sm" style={{ marginBottom: '0.5rem' }}>📍 {d.city} • Age: {d.age || 'N/A'}</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                        <span className={`badge ${d.availability ? 'badge-available' : 'badge-unavailable'}`}>
                                            {d.availability ? '✅ Available' : '❌ Unavailable'}
                                        </span>
                                    </div>
                                    {d.contactNumber && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <a href={`tel:${d.contactNumber}`} className="btn btn-outline btn-sm">📞 {d.contactNumber}</a>
                                        </div>
                                    )}
                                    {d.lastDonationDate && (
                                        <div className="text-muted text-sm" style={{ marginTop: '0.4rem' }}>
                                            Last donated: {new Date(d.lastDonationDate).toLocaleDateString('en-IN')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : searched ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3>No donors found</h3>
                        <p>Try different blood group or city</p>
                    </div>
                ) : null}
            </main>
        </div>
    );
};

export default SearchDonors;
