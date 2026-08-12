// ============================================================
// AuthContext.jsx — Global Authentication State
// ============================================================
// Provides authentication state and actions to the entire app.
// Any component can consume this context via useAuth() hook.
//
// Stores:
//   token  — JWT string from localStorage
//   user   — { id, name, email, role }
//   isAuthenticated — boolean derived from token presence
//   loading — true while restoring session from localStorage
//
// Actions:
//   loginUser(token, user)  — store credentials after login/signup
//   logoutUser()            — clear credentials, redirect to login
// ============================================================

import { createContext, useState, useEffect, useCallback } from 'react';

// Create the context object
export const AuthContext = createContext(null);

// ============================================================
// AuthProvider
// Wrap the entire app with this so all children can access auth state.
// ============================================================
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    // loading = true while we restore session from localStorage on mount
    // This prevents a flash of the login page when user is already logged in
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser  = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                // Decode the JWT payload (base64 — no verification needed client-side,
                // server will reject expired tokens on next API call anyway)
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                const isExpired = payload.exp && payload.exp * 1000 < Date.now();

                if (isExpired) {
                    // Token is expired — clear stale credentials immediately
                    // This prevents the user from briefly reaching a dashboard
                    // only to be kicked out when getProfile() returns 401
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                } else {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch {
                // Corrupted token or user data — clear it
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        // Done restoring — allow routes to render
        setLoading(false);
    }, []);

    // ========================================
    // LOGIN — Save credentials
    // Called after successful signup or login
    // ========================================
    const loginUser = useCallback((newToken, newUser) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        setIsLoggingOut(false);
    }, []);

    // ========================================
    // LOGOUT — Clear credentials
    // Removes token and user from memory and localStorage
    // Prevents ProtectedRoute race condition by setting isLoggingOut
    // ========================================
    const logoutUser = useCallback((navigate, targetPath = '/') => {
        setIsLoggingOut(true);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        if (navigate) {
            navigate(targetPath, { replace: true });
        }
        setTimeout(() => {
            setIsLoggingOut(false);
        }, 300);
    }, []);

    // Derived boolean — true if user has a valid token
    const isAuthenticated = !!token;

    const value = {
        token,
        user,
        isAuthenticated,
        loading,
        isLoggingOut,
        loginUser,
        logoutUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
