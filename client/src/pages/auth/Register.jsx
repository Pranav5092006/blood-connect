import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const Register = () => {
    const [searchParams] = useSearchParams();
    const [role, setRole] = useState(searchParams.get('role') || 'donor');
    const [form, setForm] = useState({ name: '', email: '', password: '', bloodGroup: '', city: '', age: '', contactNumber: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...form, role, age: form.age ? Number(form.age) : undefined };
            const { data } = await authAPI.register(payload);
            login(data.token, data.user);
            toast.success('Welcome to Blood Connect! 🩸');
            const routes = { donor: '/donor/dashboard', recipient: '/recipient/dashboard' };
            navigate(routes[data.user.role]);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-visual">
                <div className="auth-visual-content" style={{ color: '#fff' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem', textAlign: 'center' }}>🩸</div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Join Blood Connect</h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 320 }}>
                        Every registration is a potential lifesaver. Donors keep availability updated; recipients get matched in minutes.
                    </p>
                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {['Secure JWT authentication', 'Role-based access control', 'Real-time donor matching', 'Emergency request priority'].map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--crimson-light)' }}>✓</span> {f}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="auth-form-area">
                <div className="auth-form-box animate-in">
                    <a href="/" className="sidebar-logo" style={{ display: 'inline-flex', marginBottom: '1.5rem', textDecoration: 'none' }}>
                        <div className="sidebar-logo-icon">🩸</div>
                        <span className="sidebar-logo-text" style={{ color: 'var(--text-primary)' }}>Blood Connect</span>
                    </a>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Register as a donor or recipient</p>

                    <div className="role-selector">
                        {['donor', 'recipient'].map(r => (
                            <div key={r} className={`role-option ${role === r ? 'selected' : ''}`} onClick={() => setRole(r)}>
                                <div className="role-option-icon">{r === 'donor' ? '💉' : '🏥'}</div>
                                <div className="role-option-label" style={{ textTransform: 'capitalize' }}>{r}</div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input className="form-input" name="name" value={form.name} onChange={handle} required placeholder="John Doe" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input className="form-input" name="email" type="email" value={form.email} onChange={handle} required placeholder="john@email.com" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password * (min 6 chars)</label>
                            <input className="form-input" name="password" type="password" value={form.password} onChange={handle} required placeholder="••••••••" />
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Blood Group</label>
                                <select className="form-select" name="bloodGroup" value={form.bloodGroup} onChange={handle}>
                                    <option value="">Select...</option>
                                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input className="form-input" name="city" value={form.city} onChange={handle} placeholder="Mumbai" />
                            </div>
                        </div>

                        {role === 'donor' && (
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Age (18–65)</label>
                                    <input className="form-input" name="age" type="number" min={18} max={65} value={form.age} onChange={handle} placeholder="25" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Contact Number</label>
                                    <input className="form-input" name="contactNumber" value={form.contactNumber} onChange={handle} placeholder="9876543210" />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
                            {loading ? '⏳ Creating Account...' : `Create ${role === 'donor' ? 'Donor' : 'Recipient'} Account`}
                        </button>
                    </form>

                    <p className="text-center mt-2" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--crimson-light)', fontWeight: 600 }}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
