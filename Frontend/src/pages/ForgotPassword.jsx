// ============================================================
// ForgotPassword.jsx — Dual-Option (Email / Phone) OTP Reset Wizard
// ============================================================
// Interactive 3-Step Password Reset:
// 1. Choose Method (Email or Phone) & Send 6-Digit OTP
// 2. Enter & Verify 6-Digit OTP Code
// 3. Reset Password & Confirm
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { sendOtp, verifyOtp, resetPasswordWithOtp } from '../services/authService';

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

const ForgotPassword = () => {
    const navigate = useNavigate();

    // ========================================
    // WIZARD STEP STATE
    // 1: Choose Method & Target
    // 2: Enter & Verify OTP
    // 3: Set New Password
    // 4: Success Screen
    // ========================================
    const [step, setStep] = useState(1);

    // Method: 'email' | 'phone'
    const [method, setMethod] = useState('email');
    const [target, setTarget] = useState('');

    // OTP Array (6 digits)
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);

    // Reset Token after OTP verification
    const [resetSessionToken, setResetSessionToken] = useState('');

    // Passwords
    const [newPassword, setNewPassword]         = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword]       = useState(false);

    // Loading & Feedback
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]         = useState('');
    const [success, setSuccess]     = useState('');
    const [fieldError, setFieldError] = useState('');

    // Resend Timer
    const [timer, setTimer] = useState(0);

    // Countdown effect
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Handle Method Tab Switch
    const handleMethodChange = (selectedMethod) => {
        setMethod(selectedMethod);
        setTarget('');
        setFieldError('');
        setError('');
        setSuccess('');
    };

    // Step 1 Validation
    const validateTarget = () => {
        if (!target.trim()) {
            setFieldError(method === 'email' ? 'Email is required' : 'Phone number is required');
            return false;
        }

        if (method === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(target.trim())) {
                setFieldError('Please enter a valid email address');
                return false;
            }
        } else {
            const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]{6,14}$/;
            if (!phoneRegex.test(target.trim())) {
                setFieldError('Please enter a valid phone number');
                return false;
            }
        }
        return true;
    };

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();

        if (!validateTarget()) return;

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await sendOtp(method, target.trim());
            setSuccess(response.message || 'OTP verification code sent successfully!');
            setTimer(30); // 30 second resend timer
            setStep(2);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to send OTP code.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // OTP Input Boxes Change Handler
    const handleOtpChange = (index, value) => {
        if (/^[0-9]?$/.test(value)) {
            const newDigits = [...otpDigits];
            newDigits[index] = value;
            setOtpDigits(newDigits);
            setFieldError('');
            setError('');

            // Auto-focus next box
            if (value && index < 5) {
                otpRefs.current[index + 1]?.focus();
            }
        }
    };

    // OTP Keydown (Backspace navigation)
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // OTP Paste Handler
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const newDigits = pastedData.split('');
            setOtpDigits(newDigits);
            otpRefs.current[5]?.focus();
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const fullOtp = otpDigits.join('');

        if (fullOtp.length < 6) {
            setFieldError('Please enter the full 6-digit OTP code');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await verifyOtp(target.trim(), fullOtp, method);
            setResetSessionToken(response.resetSessionToken);
            setSuccess('OTP verified successfully!');
            setStep(3);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Invalid or expired OTP code.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!newPassword) {
            setFieldError('Password is required');
            return;
        }
        if (newPassword.length < 8) {
            setFieldError('Password must be at least 8 characters long');
            return;
        }
        if (newPassword !== confirmPassword) {
            setFieldError('Passwords do not match');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await resetPasswordWithOtp(resetSessionToken, newPassword);
            setSuccess('Password changed successfully!');
            setStep(4);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to update password.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

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
                    <h1 className="auth-title">Forgot Password?</h1>
                    <p className="auth-subtitle">
                        {step === 1 && 'Choose how you want to receive your 6-digit OTP code.'}
                        {step === 2 && `Enter the 6-digit OTP sent to your ${method === 'email' ? 'email' : 'phone number'}.`}
                        {step === 3 && 'Enter and confirm your new password.'}
                        {step === 4 && 'Your password has been successfully updated.'}
                    </p>
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

                {/* ============================================================
                    STEP 1: METHOD SELECTION & TARGET INPUT
                ============================================================ */}
                {step === 1 && (
                    <motion.form
                        onSubmit={handleSendOtp}
                        noValidate
                        className="auth-form"
                        variants={formContainerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* ---- Method Switcher Tabs ---- */}
                        <motion.div className="otp-method-tabs" variants={fieldVariants}>
                            <button
                                type="button"
                                className={`otp-tab-btn ${method === 'email' ? 'active' : ''}`}
                                onClick={() => handleMethodChange('email')}
                            >
                                <span>📧</span> Reset via Email
                            </button>
                            <button
                                type="button"
                                className={`otp-tab-btn ${method === 'phone' ? 'active' : ''}`}
                                onClick={() => handleMethodChange('phone')}
                            >
                                <span>📱</span> Reset via Phone
                            </button>
                        </motion.div>

                        {/* ---- Target Field ---- */}
                        <motion.div className="form-group" variants={fieldVariants}>
                            <label htmlFor="target" className="form-label">
                                {method === 'email' ? 'Registered Email Address' : 'Registered Phone Number'}
                            </label>
                            <input
                                id="target"
                                type={method === 'email' ? 'email' : 'tel'}
                                name="target"
                                value={target}
                                onChange={(e) => {
                                    setTarget(e.target.value);
                                    setFieldError('');
                                    setError('');
                                }}
                                placeholder={method === 'email' ? 'john@example.com' : '+1 234 567 8900'}
                                className={`form-input ${fieldError ? 'input-error' : ''}`}
                                disabled={submitting}
                                autoFocus
                            />
                            {fieldError && <span className="field-error">{fieldError}</span>}
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
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Send OTP Code'
                                )}
                            </motion.button>
                        </motion.div>
                    </motion.form>
                )}

                {/* ============================================================
                    STEP 2: 6-DIGIT OTP VERIFICATION
                ============================================================ */}
                {step === 2 && (
                    <motion.form
                        onSubmit={handleVerifyOtp}
                        noValidate
                        className="auth-form"
                        variants={formContainerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="otp-target-badge">
                            OTP Sent To: <strong>{target}</strong>
                        </div>

                        {/* ---- 6-Digit Box Input ---- */}
                        <motion.div className="otp-boxes-container" variants={fieldVariants}>
                            {otpDigits.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => (otpRefs.current[idx] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                    onPaste={handleOtpPaste}
                                    className="otp-box-input"
                                    disabled={submitting}
                                    autoFocus={idx === 0}
                                />
                            ))}
                        </motion.div>

                        {fieldError && <span className="field-error" style={{ justifyContent: 'center' }}>{fieldError}</span>}

                        {/* ---- Verify Button ---- */}
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
                                        Verifying OTP...
                                    </>
                                ) : (
                                    'Verify OTP Code'
                                )}
                            </motion.button>
                        </motion.div>

                        {/* ---- Resend Option & Back to Target ---- */}
                        <div className="otp-resend-row">
                            {timer > 0 ? (
                                <span className="otp-timer-text">Resend OTP in <strong>{timer}s</strong></span>
                            ) : (
                                <button
                                    type="button"
                                    className="otp-resend-btn"
                                    onClick={handleSendOtp}
                                    disabled={submitting}
                                >
                                    Resend OTP Code
                                </button>
                            )}
                            <button
                                type="button"
                                className="otp-change-target-btn"
                                onClick={() => {
                                    setStep(1);
                                    setOtpDigits(['', '', '', '', '', '']);
                                    setError('');
                                    setSuccess('');
                                }}
                            >
                                Change {method === 'email' ? 'Email' : 'Phone'}
                            </button>
                        </div>
                    </motion.form>
                )}

                {/* ============================================================
                    STEP 3: NEW PASSWORD FORM
                ============================================================ */}
                {step === 3 && (
                    <motion.form
                        onSubmit={handleResetPassword}
                        noValidate
                        className="auth-form"
                        variants={formContainerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* ---- New Password Field ---- */}
                        <motion.div className="form-group" variants={fieldVariants}>
                            <label htmlFor="newPassword" className="form-label">
                                New Password
                            </label>
                            <div className="input-wrapper">
                                <input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setFieldError('');
                                        setError('');
                                    }}
                                    placeholder="Min. 8 characters"
                                    className={`form-input ${fieldError ? 'input-error' : ''}`}
                                    disabled={submitting}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </motion.div>

                        {/* ---- Confirm Password Field ---- */}
                        <motion.div className="form-group" variants={fieldVariants}>
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm New Password
                            </label>
                            <div className="input-wrapper">
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setFieldError('');
                                        setError('');
                                    }}
                                    placeholder="Re-enter new password"
                                    className={`form-input ${fieldError ? 'input-error' : ''}`}
                                    disabled={submitting}
                                />
                            </div>
                            {fieldError && <span className="field-error">{fieldError}</span>}
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
                                        Updating Password...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </motion.button>
                        </motion.div>
                    </motion.form>
                )}

                {/* ============================================================
                    STEP 4: SUCCESS SCREEN
                ============================================================ */}
                {step === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => navigate('/login')}
                        >
                            Go to Login
                        </button>
                    </div>
                )}

                {/* ---- Footer Link ---- */}
                <p className="auth-footer">
                    Remember your password?{' '}
                    <Link to="/login" className="auth-link">
                        Back to Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
