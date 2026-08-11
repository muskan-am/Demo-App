// ============================================================
// AdminDashboard.jsx — Admin Dashboard
// ============================================================
// Protected route — only accessible to users with role="admin".
// RoleProtectedRoute in App.jsx handles the role guard.
//
// On mount: fetches fresh profile data from GET /api/auth/profile
// Then verifies role === "admin" client-side as an extra check.
// This ensures displayed data is always current from the DB.
//
// Security Layer:
// - RoleProtectedRoute blocks non-admins at the route level
// - This component ALSO checks role and redirects non-admins
//   (defense in depth — double verification)
//
// Displays: admin-specific welcome, name, email, role, status, date
// Provides: Logout button that clears auth + redirects to Home ("/")
//
// Error handling:
// - Token expired / invalid → auto logout + redirect to Home ("/")
// - Role not admin → redirect to /dashboard
// - Other errors → show error message with retry option
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout } from '../services/authService';
import useAuth from '../hooks/useAuth';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logoutUser } = useAuth();

    // ============================================================
    // STATE
    // profile    — fresh user data fetched from backend
    // loading    — true while API call is in progress
    // error      — error message if profile fetch fails
    // loggingOut — true while logout API call is in progress
    // ============================================================
    const [profile, setProfile]       = useState(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [loggingOut, setLoggingOut] = useState(false);

    // ============================================================
    // fetchProfile()
    // Fetches the authenticated user's profile from the backend.
    //
    // Why fetch fresh data instead of using AuthContext user?
    // - AuthContext stores what the server returned at login time
    // - Between login and now, the role may have been changed by
    //   another admin, or the account may have been deactivated
    // - Fetching fresh ensures we display current DB state
    //
    // Security check:
    // After fetching, if role !== "admin", redirect to /dashboard.
    // This is a second line of defense (RoleProtectedRoute is first).
    //
    // Token expired / 401 error:
    // - Auto logout clears AuthContext + localStorage
    // - Redirects to Login so user can re-authenticate
    //
    // Other errors:
    // - Show error message in UI
    // - User can retry
    // ============================================================
    const fetchProfile = async () => {
        setLoading(true);
        setError('');

        try {
            // GET /api/auth/profile
            // Axios interceptor automatically attaches JWT
            const response = await getProfile();

            // Backend response shape:
            // { success: true, data: { user: { id, name, email, role, isActive, createdAt } } }
            const userData = response.data.user;

            // ========================================
            // SECURITY CHECK — Verify role is "admin"
            // RoleProtectedRoute should already block non-admins,
            // but this is defense in depth.
            // If someone's role was demoted after login but before
            // this page loaded, kick them out.
            // ========================================
            if (userData.role !== 'admin') {
                navigate('/dashboard', { replace: true });
                return;
            }

            setProfile(userData);

        } catch (err) {
            const status = err.response?.status;

            if (status === 401) {
                logoutUser(navigate, '/');
                return;
            }

            // Any other error (network, 500, etc.) — show message
            const message =
                err.response?.data?.message ||
                err.message ||
                'Failed to load profile. Please try again.';

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // FETCH PROFILE ON MOUNT
    // Runs once when the AdminDashboard component first renders.
    // Empty dependency array [] means: run only on mount.
    // ============================================================
    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ============================================================
    // handleLogout()
    // Logs out the admin user and redirects to Home ("/").
    //
    // Process:
    // 1. Set loggingOut=true (shows spinner on button)
    // 2. Call backend logout endpoint (optional — notifies server)
    // 3. Call logoutUser(navigate, '/') from AuthContext
    //    → Clears token + user from context AND localStorage, redirects to Home ("/")
    // ============================================================
    const handleLogout = async () => {
        setLoggingOut(true);

        try {
            // Inform the backend (optional — good practice)
            await logout();
        } catch {
            // Backend logout failure is non-critical
            // Client-side logout must still proceed
        } finally {
            logoutUser(navigate, '/');
        }
    };

    // ============================================================
    // formatDate(dateString)
    // Converts ISO date string to readable format.
    // e.g. "2024-02-15T10:30:00.000Z" → "February 15, 2024"
    // ============================================================
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // ============================================================
    // RENDER — LOADING STATE
    // Show spinner while profile is being fetched.
    // Prevents a flash of empty content.
    // ============================================================
    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="loading-screen">
                    <div className="spinner" aria-label="Loading admin profile" />
                    <p>Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    // ============================================================
    // RENDER — ERROR STATE
    // Show error message with a retry button.
    // Does NOT log the user out — token may still be valid.
    // ============================================================
    if (error) {
        return (
            <div className="dashboard-page">
                <div className="error-screen">
                    <p className="error-message">{error}</p>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={fetchProfile}
                    >
                        Try Again
                    </button>
                    <button
                        type="button"
                        className="btn-logout"
                        onClick={handleLogout}
                        disabled={loggingOut}
                    >
                        {loggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            </div>
        );
    }

    // ============================================================
    // RENDER — ADMIN DASHBOARD
    // Profile data is available — render the full admin dashboard.
    // ============================================================
    return (
        <div className="dashboard-page admin-dashboard">
            <div className="dashboard-card">

                {/* ---- Header ---- */}
                <div className="dashboard-header">
                    <div className="dashboard-header-text">
                        <h1 className="dashboard-title">
                            Welcome, Admin {profile?.name} 👑
                        </h1>
                        <p className="dashboard-subtitle">
                            Administrator Control Panel
                        </p>
                    </div>

                    {/* ---- Logout Button ---- */}
                    <button
                        type="button"
                        className="btn-logout"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        aria-label="Logout"
                    >
                        {loggingOut ? (
                            <>
                                <span className="btn-spinner" aria-hidden="true" />
                                Logging out...
                            </>
                        ) : (
                            'Logout'
                        )}
                    </button>
                </div>

                {/* ---- Profile Info Grid ---- */}
                <div className="profile-grid">

                    {/* Name */}
                    <div className="profile-item">
                        <span className="profile-label">Full Name</span>
                        <span className="profile-value">{profile?.name}</span>
                    </div>

                    {/* Email */}
                    <div className="profile-item">
                        <span className="profile-label">Email Address</span>
                        <span className="profile-value">{profile?.email}</span>
                    </div>

                    {/* Role — displayed as an admin badge */}
                    <div className="profile-item">
                        <span className="profile-label">Role</span>
                        <span className={`role-badge role-${profile?.role}`}>
                            {profile?.role
                                ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                                : 'N/A'}
                        </span>
                    </div>

                    {/* Account Status */}
                    <div className="profile-item">
                        <span className="profile-label">Account Status</span>
                        <span className={`status-badge ${profile?.isActive ? 'status-active' : 'status-inactive'}`}>
                            {profile?.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Member Since */}
                    <div className="profile-item">
                        <span className="profile-label">Admin Since</span>
                        <span className="profile-value">{formatDate(profile?.createdAt)}</span>
                    </div>

                </div>

                {/* ---- Admin Note ---- */}
                <div className="admin-note">
                    <p>
                        🔒 You are logged in with administrator privileges.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
