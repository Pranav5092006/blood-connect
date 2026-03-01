import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ROLE_ROUTES = {
    admin: '/admin/dashboard',
    donor: '/donor/dashboard',
    recipient: '/recipient/dashboard',
};

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await authAPI.login(form);
            login(data.token, data.user);
            toast.success(`Welcome back, ${data.user.name}! 🩸`);
            const from = location.state?.from?.pathname || ROLE_ROUTES[data.user.role] || '/';
            navigate(from, { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-visual">
                <div className="auth-visual-content" style={{ color: '#fff', textAlign: 'center' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🩸</div>
                    <h2 style={{ fontSize: '2.25rem', color: '#fff', marginBottom: '1rem' }}>Blood Connect</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 320, lineHeight: 1.7 }}>
                        Connecting hearts, saving lives. Sign in to manage donations or blood requests.
                    </p>
                    <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Demo Account</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
                            admin@bloodconnect.com<br />Admin@1234
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-form-area">
                <div className="auth-form-box animate-in">
                    <a href="/" className="sidebar-logo" style={{ display: 'inline-flex', marginBottom: '1.5rem', textDecoration: 'none' }}>
                        <div className="sidebar-logo-icon">🩸</div>
                        <span className="sidebar-logo-text" style={{ color: 'var(--text-primary)' }}>Blood Connect</span>
                    </a>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your account</p>

                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-input" name="email" type="email" value={form.email} onChange={handle} required placeholder="your@email.com" />
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="form-label">Password</label>
                                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--crimson-light)' }}>Forgot password?</Link>
                            </div>
                            <input className="form-input" name="password" type="password" value={form.password} onChange={handle} required placeholder="••••••••" />
                        </div>

                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
                            {loading ? '⏳ Signing In...' : '🔐 Sign In'}
                        </button>
                    </form>

                    <p className="text-center mt-2" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Don&apos;t have an account? <Link to="/register" style={{ color: 'var(--crimson-light)', fontWeight: 600 }}>Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
