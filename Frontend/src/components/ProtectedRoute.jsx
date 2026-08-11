// ============================================================
// ProtectedRoute.jsx — Authentication Guard
// ============================================================
// Wraps routes that require the user to be logged in.
// If user is not authenticated → redirect to /login.
// If user IS authenticated → render the page.
//
// Uses useEffect-based navigation instead of declarative
// <Navigate> to prevent a race condition where logoutUser()
// sets isAuthenticated=false in the same render cycle as
// navigate('/'), causing ProtectedRoute to fire <Navigate to="/login">
// before React Router has finished processing the new location.
//
// useEffect only runs AFTER the DOM has committed, so by the
// time it checks isAuthenticated, if navigate('/') already
// changed the route, this component is no longer mounted and
// the effect never runs.
// ============================================================

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, isLoggingOut } = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();

    useEffect(() => {
        // Do nothing while AuthContext is still restoring
        // session from localStorage or when user is logging out to Home
        if (loading || isLoggingOut) return;

        // If not authenticated, redirect to /login and remember
        // where they were trying to go so we can redirect back
        // after a successful login (state.from pattern)
        if (!isAuthenticated) {
            navigate('/login', {
                replace: true,
                state: { from: location.pathname }
            });
        }
    }, [loading, isAuthenticated, isLoggingOut, navigate, location.pathname]);

    // Show spinner while session is being restored
    if (loading) {
        return (
            <div className="full-page-loader">
                <div className="spinner" />
            </div>
        );
    }

    // If not authenticated, render nothing while the useEffect
    // above processes the redirect — avoids a flash of content
    if (!isAuthenticated) {
        return null;
    }

    // Authenticated → render the protected page
    return children;
};

export default ProtectedRoute;
