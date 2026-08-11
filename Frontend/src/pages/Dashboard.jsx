// ============================================================
// Dashboard.jsx — User Dashboard
// ============================================================
// Protected route — only accessible to authenticated users.
// ProtectedRoute in App.jsx handles the access guard.
//
// On mount: fetches fresh profile data from GET /api/auth/profile
// This ensures displayed data is always current from the DB,
// not just what was stored at login time in AuthContext.
//
// Displays: name, email, role, account status, joined date.
// Provides: Logout button that clears auth state + redirects to Home ("/").
//
// Error handling:
// - Token expired / invalid → auto logout + redirect to Home ("/")
// - Other errors → show error message with retry option
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { getProfile, logout } from '../services/authService';
import useAuth from '../hooks/useAuth';

// ---- Reusable animation variants ----
const cardVariants = {
    hidden: { opacity: 0, scale: 0.97, y: 24 },
    visible: {
        opacity: 1, scale: 1, y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
};

const headerVariants = {
    hidden: { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
};

const profileContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.15 }
    }
};

const profileItemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.38, ease: 'easeOut' } }
};

const Dashboard = () => {
    const navigate  = useNavigate();
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
    // - Between login and this page load, profile may have changed
    //   (e.g., admin changed the role, name was updated elsewhere)
    // - Fetching fresh ensures dashboard always shows current DB state
    //
    // Token expired / 401 error:
    // - Auto logout clears AuthContext + localStorage
    // - Redirects to Login so user can re-authenticate
    //
    // Other errors:
    // - Show error message in UI
    // - User can click "Try Again" to retry
    // ============================================================
    const fetchProfile = async () => {
        setLoading(true);
        setError('');

        try {
            // GET /api/auth/profile
            // Axios interceptor in authService automatically
            // attaches Authorization: Bearer <token> header
            const response = await getProfile();

            // Backend response shape:
            // { success: true, data: { user: { id, name, email, role, isActive, createdAt } } }
            setProfile(response.data.user);

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
    // Runs once when the Dashboard component first renders.
    // Empty dependency array [] means: run only on mount.
    // ============================================================
    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ============================================================
    // handleLogout()
    // Logs out the user and redirects to Home ("/").
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
                    <div className="spinner" aria-label="Loading profile" />
                    <p>Loading your profile...</p>
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
    // RENDER — DASHBOARD
    // Profile data is available — render the full dashboard.
    // ============================================================
    return (
        <div className="dashboard-page">
            <motion.div
                className="dashboard-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
            >

                {/* ---- Header ---- */}
                <motion.div
                    className="dashboard-header"
                    variants={headerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="dashboard-header-text">
                        <h1 className="dashboard-title">
                            Welcome, {profile?.name} 👋
                        </h1>
                        <p className="dashboard-subtitle">
                            Here&apos;s your account overview
                        </p>
                    </div>

                    {/* ---- Logout Button ---- */}
                    <motion.button
                        type="button"
                        className="btn-logout"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        aria-label="Logout"
                        whileHover={{ scale: loggingOut ? 1 : 1.04, transition: { duration: 0.15 } }}
                        whileTap={{ scale: loggingOut ? 1 : 0.96 }}
                    >
                        {loggingOut ? (
                            <>
                                <span className="btn-spinner" aria-hidden="true" />
                                Logging out...
                            </>
                        ) : (
                            'Logout'
                        )}
                    </motion.button>
                </motion.div>

                {/* ---- Profile Info Grid — staggered rows ---- */}
                <motion.div
                    className="profile-grid"
                    variants={profileContainerVariants}
                    initial="hidden"
                    animate="visible"
                >

                    {/* Name */}
                    <motion.div className="profile-item" variants={profileItemVariants}>
                        <span className="profile-label">Full Name</span>
                        <span className="profile-value">{profile?.name}</span>
                    </motion.div>

                    {/* Email */}
                    <motion.div className="profile-item" variants={profileItemVariants}>
                        <span className="profile-label">Email Address</span>
                        <span className="profile-value">{profile?.email}</span>
                    </motion.div>

                    {/* Role — displayed as a badge */}
                    <motion.div className="profile-item" variants={profileItemVariants}>
                        <span className="profile-label">Role</span>
                        <motion.span
                            className={`role-badge role-${profile?.role}`}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.35, delay: 0.35 }}
                        >
                            {profile?.role
                                ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                                : 'N/A'}
                        </motion.span>
                    </motion.div>

                    {/* Account Status */}
                    <motion.div className="profile-item" variants={profileItemVariants}>
                        <span className="profile-label">Account Status</span>
                        <motion.span
                            className={`status-badge ${profile?.isActive ? 'status-active' : 'status-inactive'}`}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.35, delay: 0.42 }}
                        >
                            {profile?.isActive ? 'Active' : 'Inactive'}
                        </motion.span>
                    </motion.div>

                    {/* Member Since */}
                    <motion.div className="profile-item" variants={profileItemVariants}>
                        <span className="profile-label">Member Since</span>
                        <span className="profile-value">{formatDate(profile?.createdAt)}</span>
                    </motion.div>

                </motion.div>

            </motion.div>
        </div>
    );
};

export default Dashboard;
