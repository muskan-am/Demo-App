// ============================================================
// Signup.jsx — User Registration Page
// ============================================================
// Handles new user registration.
// Validates all fields client-side before sending to backend.
// On success: shows confirmation message, redirects to Login.
// On failure: displays backend error message.
//
// Does NOT log the user in after signup.
// User must explicitly login after registration.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { signup, googleLogin } from '../services/authService';
import useAuth from '../hooks/useAuth';

// ---- Reusable variants ----
const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
};

const formContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const fieldVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const alertVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
    exit:   { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.2 } }
};

const Signup = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // ============================================================
    // FORM STATE
    // ============================================================
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });


    // ============================================================
    // UI STATE
    // ============================================================
    const [showPassword, setShowPassword]               = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading]                         = useState(false);
    const [error, setError]                             = useState('');
    const [success, setSuccess]                         = useState('');

    // ============================================================
    // VALIDATION ERRORS STATE
    // ============================================================
    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // ============================================================
    // GOOGLE AUTH CALLBACK
    // ============================================================
    const handleGoogleResponse = useCallback(async (response) => {
        if (!response || !response.credential) {
            setError('Google authentication was cancelled or failed.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const apiRes = await googleLogin(response.credential);
            const { token, user: loggedInUser } = apiRes.data;

            // Store credentials in AuthContext
            loginUser(token, loggedInUser);

            // Role-based redirect
            if (loggedInUser.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            console.error('[GOOGLE SIGN-UP ERROR]', err);
            const message =
                err.response?.data?.message ||
                err.message ||
                'Google Authentication failed. Please try again.';

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [loginUser, navigate]);

    // ============================================================
    // INITIALIZE GOOGLE IDENTITY SERVICES
    // ============================================================
    useEffect(() => {
        if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID') {
            return;
        }

        const initGoogle = () => {
            if (window.google?.accounts?.id) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: googleClientId,
                        callback: handleGoogleResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true
                    });

                    const btnDiv = document.getElementById('googleSignUpDiv');
                    if (btnDiv) {
                        btnDiv.innerHTML = '';
                        window.google.accounts.id.renderButton(btnDiv, {
                            theme: 'outline',
                            size: 'large',
                            width: '380',
                            text: 'continue_with',
                            shape: 'rectangular',
                            logo_alignment: 'left'
                        });
                    }

                } catch (err) {
                    console.error('Google Sign-Up render error:', err);
                }
            }
        };

        if (window.google?.accounts?.id) {
            initGoogle();
        } else {
            const timer = setInterval(() => {
                if (window.google?.accounts?.id) {
                    initGoogle();
                    clearInterval(timer);
                }
            }, 300);
            return () => clearInterval(timer);
        }
    }, [googleClientId, handleGoogleResponse]);

    // ============================================================
    // handleChange(e)
    // ============================================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        setError('');
    };

    // ============================================================
    // validate()
    // ============================================================
    const validate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
            isValid = false;
        } else if (formData.name.trim().length < 3) {
            errors.name = 'Name must be at least 3 characters';
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!formData.password) {
            errors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
            isValid = false;
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    // ============================================================
    // handleSubmit(e)
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await signup(formData.name, formData.email, formData.password, formData.phone);

            setSuccess('Account created successfully! Redirecting to Login...');


            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                'Signup failed. Please try again.';

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="auth-page">
            <motion.div
                className="auth-card"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
            >

                {/* ---- Header ---- */}
                <div className="auth-header">
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Sign up to get started</p>
                </div>

                {/* ---- Alerts ---- */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            className="alert alert-success"
                            role="alert"
                            variants={alertVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="alert alert-error"
                            role="alert"
                            variants={alertVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ---- Signup Form ---- */}
                <motion.form
                    onSubmit={handleSubmit}
                    noValidate
                    className="auth-form"
                    variants={formContainerVariants}
                    initial="hidden"
                    animate="visible"
                >

                    {/* ---- Name Field ---- */}
                    <motion.div className="form-group" variants={fieldVariants}>
                        <label htmlFor="name" className="form-label">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={`form-input ${fieldErrors.name ? 'input-error' : ''}`}
                            disabled={loading}
                            autoComplete="name"
                        />
                        {fieldErrors.name && (
                            <span className="field-error">{fieldErrors.name}</span>
                        )}
                    </motion.div>

                    {/* ---- Email Field ---- */}
                    <motion.div className="form-group" variants={fieldVariants}>
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                            disabled={loading}
                            autoComplete="email"
                        />
                        {fieldErrors.email && (
                            <span className="field-error">{fieldErrors.email}</span>
                        )}
                    </motion.div>

                    {/* ---- Phone Number Field ---- */}
                    <motion.div className="form-group" variants={fieldVariants}>
                        <label htmlFor="phone" className="form-label">
                            Phone Number <span style={{ opacity: 0.65, fontWeight: 400 }}>(Optional)</span>
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 234 567 8900"
                            className="form-input"
                            disabled={loading}
                            autoComplete="tel"
                        />
                    </motion.div>


                    {/* ---- Password Field ---- */}
                    <motion.div className="form-group" variants={fieldVariants}>
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <div className="input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min. 8 characters"
                                className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                                disabled={loading}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                tabIndex={-1}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <span className="field-error">{fieldErrors.password}</span>
                        )}
                    </motion.div>

                    {/* ---- Confirm Password Field ---- */}
                    <motion.div className="form-group" variants={fieldVariants}>
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password
                        </label>
                        <div className="input-wrapper">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter your password"
                                className={`form-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                                disabled={loading}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {fieldErrors.confirmPassword && (
                            <span className="field-error">{fieldErrors.confirmPassword}</span>
                        )}
                    </motion.div>

                    {/* ---- Submit Button ---- */}
                    <motion.div variants={fieldVariants}>
                        <motion.button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02, transition: { duration: 0.15 } }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                        >
                            {loading ? (
                                <>
                                    <span className="btn-spinner" aria-hidden="true" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </motion.button>
                    </motion.div>

                </motion.form>

                {/* ---- OR Divider ---- */}
                <div className="auth-divider">
                    <span>OR</span>
                </div>

                {/* ---- Continue with Google Button ---- */}
                <div className="google-auth-wrapper">
                    <div id="googleSignUpDiv" className="google-btn-container"></div>
                    {(!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID') && (
                        <button
                            type="button"
                            className="google-custom-btn"
                            onClick={() => setError('Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID in Frontend/.env')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            Continue with Google
                        </button>
                    )}
                </div>

                {/* ---- Footer Link ---- */}
                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">
                        Sign in
                    </Link>
                </p>

            </motion.div>
        </div>
    );
};

export default Signup;

