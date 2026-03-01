import axios from 'axios';

const api = axios.create({
    // In production (Vercel), VITE_API_URL → Render backend
    // In development, Vite proxy handles /api → localhost:5000
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('bc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally — clear storage only, let React Router handle redirects
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('bc_token');
            localStorage.removeItem('bc_user');
        }
        return Promise.reject(err);
    }
);

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// Users
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    toggleAvailability: () => api.patch('/users/availability'),
};

// Requests
export const requestAPI = {
    create: (data) => api.post('/requests', data),
    getAll: (params) => api.get('/requests', { params }),
    getOne: (id) => api.get(`/requests/${id}`),
    respond: (id, action) => api.patch(`/requests/${id}/respond`, { action }),
    complete: (id) => api.patch(`/requests/${id}/complete`),
    delete: (id) => api.delete(`/requests/${id}`),
};

// Donors
export const donorAPI = {
    search: (params) => api.get('/donors/search', { params }),
    history: () => api.get('/donors/history'),
};

// Admin
export const adminAPI = {
    stats: () => api.get('/admin/stats'),
    users: (params) => api.get('/admin/users', { params }),
    toggleBlock: (id) => api.patch(`/admin/users/${id}/block`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    requests: (params) => api.get('/admin/requests', { params }),
    updateRequestStatus: (id, status) => api.patch(`/admin/requests/${id}/status`, { status }),
};

export default api;
