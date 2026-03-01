import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import { adminAPI } from '../../api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');

    const fetchUsers = () => {
        setLoading(true);
        const params = roleFilter ? { role: roleFilter } : {};
        adminAPI.users(params).then(r => setUsers(r.data.users)).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, [roleFilter]);

    const toggleBlock = async (id, isBlocked) => {
        try {
            const { data } = await adminAPI.toggleBlock(id);
            setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: data.isBlocked } : u));
            toast.success(data.message);
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const deleteUser = async (id) => {
        if (!confirm('Permanently delete this user?')) return;
        try {
            await adminAPI.deleteUser(id);
            setUsers(prev => prev.filter(u => u._id !== id));
            toast.success('User deleted');
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage donor and recipient accounts</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {[['', 'All Users'], ['donor', '💉 Donors'], ['recipient', '🏥 Recipients']].map(([val, label]) => (
                        <button key={val} className={`btn btn-sm ${roleFilter === val ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setRoleFilter(val)}>{label}</button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-area"><div className="spinner" /></div>
                ) : users.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No users found</h3></div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Blood Group</th>
                                    <th>City</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td className="text-muted" style={{ fontSize: '0.85rem' }}>{u.email}</td>
                                        <td><span className={`badge ${u.role === 'donor' ? 'badge-accepted' : 'badge-pending'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                                        <td>{u.bloodGroup ? <span className="blood-chip" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>{u.bloodGroup}</span> : '—'}</td>
                                        <td>{u.city || '—'}</td>
                                        <td>
                                            <span className={`badge ${u.isBlocked ? 'badge-rejected' : 'badge-accepted'}`}>
                                                {u.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button className={`btn btn-sm ${u.isBlocked ? 'btn-success' : 'btn-outline'}`} onClick={() => toggleBlock(u._id, u.isBlocked)}>
                                                    {u.isBlocked ? '✅ Unblock' : '🚫 Block'}
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>🗑</button>
                                            </div>
                                        </td>
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

export default AdminUsers;
