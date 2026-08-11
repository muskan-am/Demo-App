// ============================================================
// useAuth.js — Custom Hook for Auth Context
// ============================================================
// Convenience hook so components don't need to import both
// useContext and AuthContext separately.
//
// Usage:
//   const { user, isAuthenticated, loginUser, logoutUser } = useAuth();
// ============================================================

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside an AuthProvider');
    }

    return context;
};

export default useAuth;
