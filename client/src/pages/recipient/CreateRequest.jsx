import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import { requestAPI } from '../../api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CreateRequest = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ bloodGroup: '', hospital: '', city: '', units: 1, emergency: false, requiredDate: '', notes: '' });
    const [loading, setLoading] = useState(false);

    const handle = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm(f => ({ ...f, [e.target.name]: val }));
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestAPI.create({ ...form, units: Number(form.units) });
            toast.success('Blood request created! 🩸');
            navigate('/recipient/my-requests');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create request';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">New Blood Request</h1>
                    <p className="page-subtitle">Fill in the details and we'll find you a matching donor</p>
                </div>

                <div style={{ maxWidth: 640 }}>
                    <div className="card">
                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Blood Group Required *</label>
                                    <select className="form-select" name="bloodGroup" value={form.bloodGroup} onChange={handle} required>
                                        <option value="">Select blood group...</option>
                                        {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Units Required *</label>
                                    <input className="form-input" name="units" type="number" min={1} max={10} value={form.units} onChange={handle} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Hospital Name *</label>
                                <input className="form-input" name="hospital" value={form.hospital} onChange={handle} required placeholder="e.g. City General Hospital" />
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input className="form-input" name="city" value={form.city} onChange={handle} required placeholder="Mumbai" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Required By Date *</label>
                                    <input className="form-input" name="requiredDate" type="date" value={form.requiredDate} onChange={handle} required min={new Date().toISOString().slice(0, 10)} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Additional Notes</label>
                                <textarea className="form-input" name="notes" value={form.notes} onChange={handle} rows={3} placeholder="Any additional information..." style={{ resize: 'vertical' }} />
                            </div>

                            {/* Emergency Toggle */}
                            <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: form.emergency ? 'rgba(192,57,43,0.08)' : 'var(--bg-secondary)', border: `1.5px solid ${form.emergency ? 'rgba(192,57,43,0.4)' : 'var(--border)'}` }}>
                                <div>
                                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        🚨 Emergency Request
                                        {form.emergency && <span className="badge badge-emergency">URGENT</span>}
                                    </div>
                                    <div className="text-muted text-sm">Mark if this is a life-threatening emergency</div>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" name="emergency" checked={form.emergency} onChange={handle} />
                                    <span className="toggle-slider" />
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                    {loading ? '⏳ Posting...' : '🩸 Post Request'}
                                </button>
                                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateRequest;
