import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleDashboard = () => {
        if (!user) return;
        const routes = { admin: '/admin/dashboard', donor: '/donor/dashboard', recipient: '/recipient/dashboard' };
        navigate(routes[user.role] || '/');
    };

    return (
        <>
            <nav className="navbar">
                <a href="/" className="navbar-brand">
                    <span className="brand-icon">🩸</span>
                    Blood Connect
                </a>
                <div className="navbar-links">
                    {user ? (
                        <button className="btn btn-primary btn-sm" onClick={handleDashboard}>
                            My Dashboard →
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            <section className="hero">
                <div className="hero-content animate-in">
                    <div className="hero-badge">🚨 Emergency-Ready Platform</div>
                    <h1 className="hero-title">
                        Save Lives With<br />
                        <span>Smart Blood</span> Matching
                    </h1>
                    <p className="hero-subtitle">
                        Blood Connect bridges the gap between blood donors and recipients in real-time. Register as a donor or create urgent blood requests — we make the connection instantly.
                    </p>
                    <div className="hero-ctas">
                        <Link to="/register?role=donor" className="btn btn-primary btn-lg">
                            🩸 Become a Donor
                        </Link>
                        <Link to="/register?role=recipient" className="btn btn-outline btn-lg">
                            Request Blood
                        </Link>
                    </div>
                    <div className="hero-stats">
                        {[
                            { value: '10K+', label: 'Registered Donors' },
                            { value: '5K+', label: 'Lives Saved' },
                            { value: '8', label: 'Blood Groups Covered' },
                            { value: '< 1hr', label: 'Avg. Response Time' },
                        ].map((s) => (
                            <div className="hero-stat" key={s.label}>
                                <div className="hero-stat-value">{s.value}</div>
                                <div className="hero-stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '5rem 2rem', background: 'var(--bg-secondary)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '0.75rem' }}>How It Works</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                        Simple, fast, and life-saving — three steps to connect
                    </p>
                    <div className="feature-grid">
                        {[
                            { icon: '📝', title: 'Register', desc: 'Sign up as a donor or recipient. Fill in your details including blood group, city, and contact.' },
                            { icon: '🔍', title: 'Match', desc: 'Recipients post blood requests. Our system matches them with available donors by blood group and location.' },
                            { icon: '💉', title: 'Donate', desc: 'Donors accept requests, coordinate with recipients, and complete the donation. Admin tracks everything.' },
                        ].map((f) => (
                            <div className="feature-card animate-in" key={f.title}>
                                <div className="feature-icon" style={{ background: 'var(--crimson-glow)' }}>{f.icon}</div>
                                <h3 style={{ marginBottom: '0.5rem' }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '5rem 2rem', background: 'var(--bg-primary)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '0.75rem' }}>Why Blood Connect?</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                        Built with safety, speed, and simplicity in mind
                    </p>
                    <div className="feature-grid">
                        {[
                            { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication, bcrypt hashing, and role-based access ensure your data is protected.', color: 'rgba(59,130,246,0.15)' },
                            { icon: '🚨', title: 'Emergency Mode', desc: 'Flag urgent requests — emergency requests are prioritized and highlighted across the platform.', color: 'rgba(192,57,43,0.15)' },
                            { icon: '📍', title: 'Location-Based', desc: 'Search donors in your city to reduce response time and increase donation success rate.', color: 'rgba(16,185,129,0.15)' },
                            { icon: '📊', title: 'Admin Oversight', desc: 'Comprehensive admin dashboard tracks all donations, users, and requests in real-time.', color: 'rgba(245,158,11,0.15)' },
                        ].map((f) => (
                            <div className="feature-card animate-in" key={f.title}>
                                <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
                                <h3 style={{ marginBottom: '0.5rem' }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '5rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--crimson-dark), var(--bg-secondary))' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Ready to Save a Life?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Join thousands of donors and recipients already on Blood Connect
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/register" className="btn btn-primary btn-lg">Create Account</Link>
                        <Link to="/login" className="btn btn-ghost btn-lg">Sign In</Link>
                    </div>
                </div>
            </section>

            <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                © 2026 Blood Connect — Saving Lives, One Drop at a Time 🩸
            </footer>
        </>
    );
};

export default LandingPage;
