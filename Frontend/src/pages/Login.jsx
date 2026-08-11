// ============================================================
// Login.jsx — User Login Page
// ============================================================
// Handles user authentication.
// Validates fields client-side before API call.
// On success: stores token + user via AuthContext,
//             then redirects based on role.
// On failure: displays backend error message.
//
// Role-based redirect:
//   role === "admin" → /admin
//   role === "user"  → /dashboard
//
// NEVER touches localStorage directly.
// All state is managed through AuthContext.loginUser().
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { login } from '../services/authService';
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

const Login = () => {
    const navigate = useNavigate();
    const { loginUser, isAuthenticated, user, loading } = useAuth();

    // ============================================================
    // REDIRECT IF ALREADY AUTHENTICATED
    // If user visits / while already logged in,
    // send them to their appropriate dashboard immediately.
    // We wait for loading=false first — this ensures AuthContext
    // has finished restoring the session from localStorage before
    // we decide whether to redirect. Without this guard, a
    // logged-in user who refreshes on / would stay on the login
    // page because isAuthenticated is briefly false while the
    // session is being restored.
    // ============================================================
    useEffect(() => {
        if (!loading && isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [loading, isAuthenticated, user, navigate]);

    // ============================================================
    // FORM STATE
    // Controlled components — React owns each input value.
    // ============================================================
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // ============================================================
    // UI STATE
    // ============================================================
    const [showPassword, setShowPassword] = useState(false); // toggle password visibility
    const [submitting, setSubmitting]     = useState(false);  // true while API request is in progress
    const [error, setError]               = useState('');     // global error banner message

    // ============================================================
    // FIELD ERRORS STATE
    // Per-field validation messages shown below each input.
    // ============================================================
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: ''
    });

    // ============================================================
    // handleChange(e)
    // Updates the field value in formData on every keystroke.
    // Also clears the field-level validation error and global
    // error banner so feedback disappears as user corrects.
    // ============================================================
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Update the specific field value
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear the inline validation error for this field
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));

        // Clear the global error banner — user is correcting
        setError('');
    };

    // ============================================================
    // validate()
    // Runs client-side validation before allowing the API call.
    // Returns true if all fields pass, false otherwise.
    // Populates fieldErrors with per-field error messages.
    //
    // Rules:
    // - email: required + valid format
    // - password: required only (server enforces min length)
    //
    // Why not validate password length here?
    // Login should allow any input — the backend decides if the
    // credentials are correct. We don't want to help attackers
    // guess that a stored password is "at least 8 chars".
    // ============================================================
    const validate = () => {
        const errors = {};
        let isValid = true;

        // Email: required + format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Password: required only
        if (!formData.password) {
            errors.password = 'Password is required';
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    // ============================================================
    // handleSubmit(e)
    // Main form submission handler.
    //
    // Process:
    // 1. Prevent default form submission (page reload)
    // 2. Run client-side validation — abort if invalid
    // 3. Set loading=true (disables button, shows spinner)
    // 4. Call authService.login(email, password)
    // 5. On success:
    //    a. Extract token + user from response
    //    b. Call loginUser(token, user) — AuthContext handles storage
    //    c. Redirect based on user.role (no hardcoding)
    // 6. On failure:
    //    a. Extract backend error message
    //    b. Display in global error banner
    // 7. finally: always reset loading=false
    //
    // IMPORTANT: localStorage is NEVER touched here.
    // loginUser() in AuthContext handles all persistence.
    // The role-based redirect reads from the API response,
    // not from any hardcoded value.
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault(); // stop browser from reloading page

        // Run client-side validation — stop if any field is invalid
        if (!validate()) return;

        setSubmitting(true);
        setError('');

        try {
            const response = await login(formData.email, formData.password);
            const { token, user: loggedInUser } = response.data;
            loginUser(token, loggedInUser);

            if (loggedInUser.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }

        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                'Login failed. Please try again.';

            setError(message);
        } finally {
            setSubmitting(false);
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
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>

                {/* ---- Global Error Banner — AnimatePresence for smooth mount/unmount ---- */}
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

                {/* ---- Login Form — staggered fields ---- */}
                <motion.form
                    onSubmit={handleSubmit}
                    noValidate
                    className="auth-form"
                    variants={formContainerVariants}
                    initial="hidden"
                    animate="visible"
                >

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
                            disabled={submitting}
                            autoComplete="email"
                        />
                        {fieldErrors.email && (
                            <span className="field-error">{fieldErrors.email}</span>
                        )}
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
                                placeholder="Enter your password"
                                className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                                disabled={submitting}
                                autoComplete="current-password"
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

                    {/* ---- Submit Button ---- */}
                    <motion.div variants={fieldVariants}>
                        <motion.button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting}
                            whileHover={{ scale: submitting ? 1 : 1.02, transition: { duration: 0.15 } }}
                            whileTap={{ scale: submitting ? 1 : 0.98 }}
                        >
                            {submitting ? (
                                <>
                                    <span className="btn-spinner" aria-hidden="true" />
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </motion.button>
                    </motion.div>

                </motion.form>

                {/* ---- Footer Link ---- */}
                <p className="auth-footer">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="auth-link">
                        Create one
                    </Link>
                </p>

            </motion.div>
        </div>
    );
};

export default Login;
