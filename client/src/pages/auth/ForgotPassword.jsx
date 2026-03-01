import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.forgotPassword(email);
            setSent(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="blood-drop-icon">🩸</div>
                    <h1>Forgot Password</h1>
                    <p>Enter your email and we'll send a reset link</p>
                </div>

                {sent ? (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                        <h3 style={{ color: 'var(--success)', marginBottom: '0.75rem' }}>Check your inbox!</h3>
                        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                            If <strong>{email}</strong> is registered, you'll receive a reset link within a minute.
                            The link expires in <strong>15 minutes</strong>.
                        </p>
                        <Link to="/login" className="btn btn-outline">← Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                className="form-input"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                autoFocus
                            />
                        </div>
                        <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                            {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
                        </button>
                        <div style={{ textAlign: 'center' }}>
                            <Link to="/login" className="text-muted" style={{ fontSize: '0.9rem' }}>← Back to Login</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
