import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import { userAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DonorProfile = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: '', bloodGroup: '', city: '', age: '', contactNumber: '', lastDonationDate: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                bloodGroup: user.bloodGroup || '',
                city: user.city || '',
                age: user.age || '',
                contactNumber: user.contactNumber || '',
                lastDonationDate: user.lastDonationDate ? user.lastDonationDate.slice(0, 10) : '',
            });
        }
    }, [user]);

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...form, age: form.age ? Number(form.age) : undefined };
            const { data } = await userAPI.updateProfile(payload);
            updateUser(data.user);
            toast.success('Profile updated! 🎉');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Keep your information up to date for better matching</p>
                </div>

                <div style={{ maxWidth: 640 }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', background: 'var(--crimson-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '2px solid rgba(192,57,43,0.3)' }}>
                                {user?.bloodGroup ? <span className="blood-chip blood-chip-lg">{user.bloodGroup}</span> : '👤'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</div>
                                <div className="text-muted text-sm">{user?.email}</div>
                                <span className={`badge ${user?.availability ? 'badge-available' : 'badge-unavailable'}`} style={{ marginTop: '0.3rem' }}>
                                    {user?.availability ? '✅ Available' : '❌ Not Available'}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-input" name="name" value={form.name} onChange={handle} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Blood Group</label>
                                    <select className="form-select" name="bloodGroup" value={form.bloodGroup} onChange={handle}>
                                        <option value="">Select...</option>
                                        {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input className="form-input" name="city" value={form.city} onChange={handle} placeholder="Mumbai" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input className="form-input" name="age" type="number" min={18} max={65} value={form.age} onChange={handle} />
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Contact Number</label>
                                    <input className="form-input" name="contactNumber" value={form.contactNumber} onChange={handle} placeholder="9876543210" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Donation Date</label>
                                    <input className="form-input" name="lastDonationDate" type="date" value={form.lastDonationDate} onChange={handle} />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                                {loading ? '⏳ Saving...' : '💾 Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DonorProfile;
