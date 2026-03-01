import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

const DonorDashboard = lazy(() => import('./pages/donor/DonorDashboard'));
const DonorProfile = lazy(() => import('./pages/donor/DonorProfile'));
const DonorRequests = lazy(() => import('./pages/donor/DonorRequests'));
const DonorHistory = lazy(() => import('./pages/donor/DonorHistory'));

const RecipientDashboard = lazy(() => import('./pages/recipient/RecipientDashboard'));
const CreateRequest = lazy(() => import('./pages/recipient/CreateRequest'));
const MyRequests = lazy(() => import('./pages/recipient/MyRequests'));
const SearchDonors = lazy(() => import('./pages/recipient/SearchDonors'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminRequests = lazy(() => import('./pages/admin/AdminRequests'));

const Fallback = () => (
    <div className="loading-area" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
    </div>
);

const App = () => (
    <AuthProvider>
        <SocketProvider>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
                    success: { iconTheme: { primary: 'var(--success)', secondary: '#fff' } },
                    error: { iconTheme: { primary: 'var(--crimson-light)', secondary: '#fff' } },
                }}
            />
            <Suspense fallback={<Fallback />}>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                    <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                    <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
                    <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />

                    {/* Donor */}
                    <Route path="/donor/dashboard" element={<ProtectedRoute roles={['donor']}><DonorDashboard /></ProtectedRoute>} />
                    <Route path="/donor/profile" element={<ProtectedRoute roles={['donor']}><DonorProfile /></ProtectedRoute>} />
                    <Route path="/donor/requests" element={<ProtectedRoute roles={['donor']}><DonorRequests /></ProtectedRoute>} />
                    <Route path="/donor/history" element={<ProtectedRoute roles={['donor']}><DonorHistory /></ProtectedRoute>} />

                    {/* Recipient */}
                    <Route path="/recipient/dashboard" element={<ProtectedRoute roles={['recipient']}><RecipientDashboard /></ProtectedRoute>} />
                    <Route path="/recipient/create-request" element={<ProtectedRoute roles={['recipient']}><CreateRequest /></ProtectedRoute>} />
                    <Route path="/recipient/my-requests" element={<ProtectedRoute roles={['recipient']}><MyRequests /></ProtectedRoute>} />
                    <Route path="/recipient/search-donors" element={<ProtectedRoute roles={['recipient']}><SearchDonors /></ProtectedRoute>} />

                    {/* Admin */}
                    <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
                    <Route path="/admin/requests" element={<ProtectedRoute roles={['admin']}><AdminRequests /></ProtectedRoute>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </SocketProvider>
    </AuthProvider>
);

export default App;
