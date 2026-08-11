// ============================================================
// RoleProtectedRoute.jsx — Role-Based Access Guard
// ============================================================
// Wraps routes that require a specific role (e.g., admin).
// Checks authentication first, then checks role.
//
// If not authenticated → redirect to /login
// If authenticated but wrong role → redirect to /dashboard
// If authenticated + correct role → render the page
//
// Uses useEffect-based navigation (same reason as ProtectedRoute):
// prevents the declarative <Navigate> race condition where
// logoutUser() and navigate('/') fire in the same batch,
// causing this component to redirect to /login before the
// router has processed the intended destination.
// ============================================================

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading, isLoggingOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Wait for session restore or logout in progress before evaluating
        if (loading || isLoggingOut) return;

        if (!isAuthenticated) {
            navigate('/login', {
                replace: true,
                state: { from: location.pathname }
            });
            return;
        }

        // Authenticated but wrong role → bounce to user dashboard
        if (!allowedRoles.includes(user?.role)) {
            navigate('/dashboard', { replace: true });
        }
    }, [loading, isAuthenticated, isLoggingOut, user, allowedRoles, navigate, location.pathname]);

    // Show spinner while session is being restored
    if (loading) {
        return (
            <div className="full-page-loader">
                <div className="spinner" />
            </div>
        );
    }

    // Render nothing while the useEffect redirect processes
    if (!isAuthenticated || !allowedRoles.includes(user?.role)) {
        return null;
    }

    // Authenticated + correct role → render the page
    return children;
};

export default RoleProtectedRoute;
