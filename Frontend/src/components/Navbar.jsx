// ============================================================
// Navbar.jsx — Framer Nova Glow Navigation Bar
// ============================================================
// Features:
//   - Nova Glow 360° rotating border rotor animation
//   - Glass pill floating container with top hairline glow & shimmer streak
//   - Nova Orbit animated logo mark
//   - Full Auth integration (Login, Sign Up, Dashboard, Logout, ThemeToggle)
//   - Mobile drawer responsive navigation
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import useAuth from '../hooks/useAuth';
import { logout } from '../services/authService';
import ThemeToggle from './ThemeToggle';

const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
};

const mobileDrawerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: 'easeIn' } }
};

const Navbar = () => {
    const { isAuthenticated, user, logoutUser } = useAuth();
    const navigate   = useNavigate();
    const location   = useLocation();

    const [menuOpen,   setMenuOpen]   = useState(false);
    const [scrolled,   setScrolled]   = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Detect scroll to toggle scrolled state
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e) => {
            if (!e.target.closest('.navbar')) setMenuOpen(false);
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [menuOpen]);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
        } catch {
            // non-critical
        } finally {
            logoutUser(navigate, '/');
        }
    };

    const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';
    const isActive = (path) => location.pathname === path;

    return (
        <motion.nav
            className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}
            aria-label="Main navigation"
            variants={navbarVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Framer Nova Glow Outer Wrap */}
            <div className="navbar__border-glow-wrap">
                {/* 360° Rotating Outer Conic Gradient Rotor */}
                <motion.div
                    className="navbar__border-rotor"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />

                {/* Glass Pill Main Container */}
                <div className="navbar__glass-pill">
                    {/* Top Hairline Glow */}
                    <div className="navbar__top-hairline" />

                    {/* Shimmer Streak */}
                    <motion.div
                        className="navbar__shimmer-streak"
                        animate={{ x: ['-100%', '1000%'] }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                    />

                    <div className="navbar__inner">
                        {/* ---- Nova Orbit Logo Mark ---- */}
                        <Link to="/" className="navbar__logo" aria-label="Home">
                            <div className="navbar__logo-mark">
                                <motion.div
                                    className="navbar__logo-rotor"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                                />
                                <div className="navbar__logo-orbit-wrap">
                                    <div className="navbar__logo-core" />
                                    <motion.div
                                        className="navbar__logo-orbit-ring"
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                    />
                                </div>
                            </div>
                            <span className="navbar__logo-text">Demo<span>App</span></span>
                        </Link>

                        {/* ---- Desktop Nav Links ---- */}
                        <ul className="navbar__links" role="list">
                            <li>
                                <a href="/#home" className={`navbar__link${isActive('/') ? ' navbar__link--active' : ''}`}>
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/#about" className="navbar__link">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="/#contact" className="navbar__link">
                                    Contact
                                </a>
                            </li>
                        </ul>

                        {/* ---- Auth Actions & Theme Switch ---- */}
                        <div className="navbar__actions">
                            <ThemeToggle />

                            {isAuthenticated ? (
                                <>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link to={dashboardPath} className="navbar__btn navbar__btn--ghost">
                                            {user?.role === 'admin' ? '⚙ Admin' : '⊞ Dashboard'}
                                        </Link>
                                    </motion.div>
                                    <motion.button
                                        type="button"
                                        className="navbar__btn navbar__btn--logout"
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        whileHover={{ scale: loggingOut ? 1 : 1.05 }}
                                        whileTap={{ scale: loggingOut ? 1 : 0.95 }}
                                    >
                                        {loggingOut ? 'Logging out…' : 'Logout'}
                                    </motion.button>
                                </>
                            ) : (
                                <>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link to="/login" className="navbar__btn navbar__btn--ghost">
                                            Login
                                        </Link>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link to="/signup" className="navbar__btn navbar__btn--primary">
                                            Sign Up
                                        </Link>
                                    </motion.div>
                                </>
                            )}
                        </div>

                        {/* ---- Hamburger for Mobile ---- */}
                        <motion.button
                            type="button"
                            className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
                            onClick={() => setMenuOpen((p) => !p)}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                            whileTap={{ scale: 0.9 }}
                        >
                            <span className="navbar__bar" />
                            <span className="navbar__bar" />
                            <span className="navbar__bar" />
                        </motion.button>
                    </div>

                    {/* ---- Mobile Drawer Menu ---- */}
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div
                                className="navbar__mobile-drawer"
                                variants={mobileDrawerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <ul className="navbar__mobile-links" role="list">
                                    <li><a href="/#home" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Home</a></li>
                                    <li><a href="/#about" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>About</a></li>
                                    <li><a href="/#contact" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Contact</a></li>
                                    
                                    <li className="navbar__mobile-divider" />

                                    {isAuthenticated ? (
                                        <>
                                            <li><Link to={dashboardPath} className="navbar__mobile-link navbar__mobile-link--accent" onClick={() => setMenuOpen(false)}>{user?.role === 'admin' ? '⚙ Admin Dashboard' : '⊞ Dashboard'}</Link></li>
                                            <li><button type="button" className="navbar__mobile-link navbar__mobile-link--logout" onClick={handleLogout} disabled={loggingOut}>{loggingOut ? 'Logging out…' : 'Logout'}</button></li>
                                        </>
                                    ) : (
                                        <>
                                            <li><Link to="/login" className="navbar__mobile-link navbar__mobile-link--accent" onClick={() => setMenuOpen(false)}>Login</Link></li>
                                            <li><Link to="/signup" className="navbar__mobile-link navbar__mobile-link--primary" onClick={() => setMenuOpen(false)}>Sign Up</Link></li>
                                        </>
                                    )}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
