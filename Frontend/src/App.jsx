// ============================================================
// App.jsx — Route Definitions
// ============================================================
// Route Structure:
//   /           → Home           (public — landing page)
//   /login      → Login          (public)
//   /signup     → Signup         (public)
//   /dashboard  → Dashboard      (protected: must be logged in)
//   /admin      → AdminDashboard (protected: logged in + role="admin")
//
// ProtectedRoute:
//   Checks if user is authenticated.
//   If not → redirects to /login
//
// RoleProtectedRoute:
//   Checks if user is authenticated AND has the required role.
//   If not authenticated → redirects to /login
//   If wrong role       → redirects to /dashboard
// ============================================================

import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

// Route Guards
import ProtectedRoute     from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// Pages
import Home           from './pages/Home';
import Login          from './pages/Login';
import Signup         from './pages/Signup';
import Dashboard      from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

// Page transition wrapper — fades in each route
const PageTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        style={{ minHeight: '100vh' }}
    >
        {children}
    </motion.div>
);

const App = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* ============================================================
                    PUBLIC ROUTES
                ============================================================ */}

                {/* Landing Page — root path */}
                <Route path="/"       element={<PageTransition><Home /></PageTransition>}   />

                {/* Login Page */}
                <Route path="/login"  element={<PageTransition><Login /></PageTransition>}  />

                {/* Signup Page */}
                <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />

                {/* ============================================================
                    PROTECTED ROUTES
                    Requires authentication (valid JWT token).
                ============================================================ */}

                {/* User Dashboard — any authenticated user */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <PageTransition>
                                <Dashboard />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                {/* Admin Dashboard — authenticated + role="admin" only */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['admin']}>
                                <PageTransition>
                                    <AdminDashboard />
                                </PageTransition>
                            </RoleProtectedRoute>
                        </ProtectedRoute>
                    }
                />

                {/* ============================================================
                    CATCH-ALL — any undefined route → Home
                ============================================================ */}
                <Route path="*" element={<PageTransition><Home /></PageTransition>} />
            </Routes>
        </AnimatePresence>
    );
};

export default App;
