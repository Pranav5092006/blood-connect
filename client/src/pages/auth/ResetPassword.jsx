import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            return toast.error('Passwords do not match');
        }
        if (form.password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        setLoading(true);
        try {
            const { data } = await authAPI.resetPassword(token, form.password);
            login(data.token, data.user);
            toast.success('Password reset! You are now logged in 🎉');
            const routes = { admin: '/admin/dashboard', donor: '/donor/dashboard', recipient: '/recipient/dashboard' };
            navigate(routes[data.user.role] || '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="blood-drop-icon">🔐</div>
                    <h1>Reset Password</h1>
                    <p>Enter your new password below</p>
                </div>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="form-input"
                                type={showPass ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handle}
                                required
                                minLength={6}
                                placeholder="At least 6 characters"
                                autoFocus
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button type="button" onClick={() => setShowPass(v => !v)}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                {showPass ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            className="form-input"
                            type={showPass ? 'text' : 'password'}
                            name="confirm"
                            value={form.confirm}
                            onChange={handle}
                            required
                            placeholder="Repeat your new password"
                        />
                        {form.confirm && form.password !== form.confirm && (
                            <p style={{ color: 'var(--crimson-light)', fontSize: '0.8rem', marginTop: '0.4rem' }}>Passwords don't match</p>
                        )}
                    </div>

                    <button className="btn btn-primary btn-lg" type="submit" disabled={loading || (form.confirm && form.password !== form.confirm)}>
                        {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
                    </button>
                    <div style={{ textAlign: 'center' }}>
                        <Link to="/login" className="text-muted" style={{ fontSize: '0.9rem' }}>← Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
