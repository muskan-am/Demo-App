// ============================================================
// ResetPassword.jsx — Password Reset Confirmation Page
// ============================================================
// Route: /reset-password/:token
// Validates token & updates user's password in MongoDB.
// On success: prompts user to navigate to /login.
// On expired/invalid token: prompts user to request new reset link.
// ============================================================

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { resetPassword } from '../services/authService';

// ---- Animation Variants ----
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

const ResetPassword = () => {
    const { token }  = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword]               = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting]                   = useState(false);
    const [error, setError]                             = useState('');
    const [isExpiredOrInvalid, setIsExpiredOrInvalid]   = useState(false);
    const [success, setSuccess]                         = useState(false);

    const [fieldErrors, setFieldErrors] = useState({
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        setError('');
    };

    const validate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.password) {
            errors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters long';
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setSubmitting(true);
        setError('');

        try {
            await resetPassword(token, formData.password);
            setSuccess(true);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                'Failed to reset password. Please try again.';

            if (err.response?.status === 400 && message.toLowerCase().includes('expired')) {
                setIsExpiredOrInvalid(true);
            }

            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // ========================================
    // STATE 1: EXPIRED / INVALID TOKEN SCREEN
    // ========================================
    if (isExpiredOrInvalid) {
        return (
            <div className="auth-page">
                <motion.div
                    className="auth-card"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="auth-header">
                        <h1 className="auth-title" style={{ color: 'var(--error)' }}>Reset Link Expired</h1>
                        <p className="auth-subtitle">
                            Your password reset link is invalid or has expired. Please request a new reset link.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => navigate('/forgot-password')}
                        >
                            Request New Reset Link
                        </button>
                        <p className="auth-footer">
                            <Link to="/login" className="auth-link">
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ========================================
    // STATE 2: SUCCESS SCREEN
    // ========================================
    if (success) {
        return (
            <div className="auth-page">
                <motion.div
                    className="auth-card"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="auth-header">
                        <h1 className="auth-title">Password Reset!</h1>
                        <p className="auth-subtitle">
                            Your password has been reset successfully. You can now log in with your new password.
                        </p>
                    </div>

                    <div className="alert alert-success" style={{ marginBottom: '24px' }}>
                        Password reset successfully!
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => navigate('/login')}
                        >
                            Go to Login
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ========================================
    // STATE 3: FORM SCREEN
    // ========================================
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
                    <h1 className="auth-title">Reset Password</h1>
                    <p className="auth-subtitle">
                        Create a strong, new password for your account.
                    </p>
                </div>

                {/* ---- Alerts ---- */}
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

                {/* ---- Form ---- */}
                <motion.form
                    onSubmit={handleSubmit}
                    noValidate
                    className="auth-form"
                    variants={formContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* ---- New Password Field ---- */}
                    <motion.div className="form-group" variants={fieldVariants}>
                        <label htmlFor="password" className="form-label">
                            New Password
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
                                disabled={submitting}
                                autoComplete="new-password"
                                autoFocus
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
                            Confirm New Password
                        </label>
                        <div className="input-wrapper">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter new password"
                                className={`form-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                                disabled={submitting}
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
                            disabled={submitting}
                            whileHover={{ scale: submitting ? 1 : 1.02, transition: { duration: 0.15 } }}
                            whileTap={{ scale: submitting ? 1 : 0.98 }}
                        >
                            {submitting ? (
                                <>
                                    <span className="btn-spinner" aria-hidden="true" />
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </motion.button>
                    </motion.div>
                </motion.form>

                {/* ---- Footer Link ---- */}
                <p className="auth-footer">
                    <Link to="/login" className="auth-link">
                        Back to Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
