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

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { signup } from '../services/authService';

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

    // ============================================================
    // FORM STATE
    // Each field is a controlled component — React owns the value.
    // ============================================================
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // ============================================================
    // UI STATE
    // ============================================================
    const [showPassword, setShowPassword]               = useState(false); // toggle password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // toggle confirm password visibility
    const [loading, setLoading]                         = useState(false);  // true while API request is in progress
    const [error, setError]                             = useState('');     // backend or validation error message
    const [success, setSuccess]                         = useState('');     // success confirmation message

    // ============================================================
    // VALIDATION ERRORS STATE
    // Per-field validation messages shown below each input.
    // ============================================================
    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // ============================================================
    // handleChange(e)
    // Updates formData whenever user types in any field.
    // Also clears the field-specific validation error on change
    // so the red message disappears once user starts correcting.
    // ============================================================
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Update field value
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear validation error for this field as user types
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));

        // Clear global error banner when user makes any change
        setError('');
    };

    // ============================================================
    // validate()
    // Runs all client-side validation rules before API call.
    // Returns true if all fields are valid, false otherwise.
    // Populates fieldErrors with descriptive messages.
    //
    // Rules:
    // - name: required, min 3 characters
    // - email: required, valid email format
    // - password: required, min 8 characters
    // - confirmPassword: required, must match password
    // ============================================================
    const validate = () => {
        const errors = {};
        let isValid = true;

        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
            isValid = false;
        } else if (formData.name.trim().length < 3) {
            errors.name = 'Name must be at least 3 characters';
            isValid = false;
        }

        // Email format validation using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Password length validation
        if (!formData.password) {
            errors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
            isValid = false;
        }

        // Confirm password match validation
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
    // Main form submission handler.
    //
    // Process:
    // 1. Prevent default form submission (page reload)
    // 2. Run client-side validation — stop if invalid
    // 3. Set loading=true — disables button, shows spinner
    // 4. Call authService.signup() with form data
    // 5. On success: show success message, redirect to / after 2s
    // 6. On failure: extract backend error and show it
    // 7. Always reset loading=false when done
    //
    // Why setLoading(false) in finally?
    // Guarantees button is always re-enabled even if an
    // unexpected error occurs — prevents permanently stuck UI.
    // ============================================================
    const handleSubmit = async (e) => {
        e.preventDefault(); // prevent browser from reloading the page

        // Run client-side validation before hitting the API
        if (!validate()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Call the signup API
            // confirmPassword is NOT sent to backend — only backend fields
            await signup(formData.name, formData.email, formData.password);

            // Show success message to user
            setSuccess('Account created successfully! Redirecting to Login...');

            // Redirect to Login page after 2 seconds
            // User must log in manually — no auto-login on signup
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            // Extract error message from Axios error response
            // err.response.data.message → backend's JSON error message
            // err.message → fallback for network errors
            const message =
                err.response?.data?.message ||
                err.message ||
                'Signup failed. Please try again.';

            setError(message);
        } finally {
            // Always re-enable the button — success or failure
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

                {/* ---- Alerts — AnimatePresence for smooth mount/unmount ---- */}
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

                {/* ---- Signup Form — staggered fields ---- */}
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
