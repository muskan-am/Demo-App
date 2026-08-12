// ============================================================
// authRoutes.js — Authentication Route Definitions
// ============================================================
// Routes are kept intentionally thin.
// They only define the HTTP method, path, middleware, and
// which controller function to call.
// All business logic lives in authController.js.
// ============================================================

const express = require('express');
const router = express.Router();

// Import controller functions
const { 
    signup, 
    login, 
    googleLogin, 
    forgotPassword, 
    resetPassword, 
    sendOtp, 
    verifyOtp, 
    resetPasswordWithOtp, 
    getProfile, 
    logout 
} = require('../controllers/authController');

// Import JWT authentication middleware
const { authenticateUser } = require('../jwt');

// ============================================================
// PUBLIC ROUTES
// These routes do not require a JWT token.
// Any client can call them.
// ============================================================

// POST /api/auth/signup → Register a new user
router.post('/signup', signup);

// POST /api/auth/login → Login with username + password
router.post('/login', login);

// POST /api/auth/google → Sign in / Sign up with Google ID Token
router.post('/google', googleLogin);

// POST /api/auth/forgot-password → Request password reset email
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password/:token → Reset password using token
router.post('/reset-password/:token', resetPassword);

// POST /api/auth/send-otp → Send 6-digit OTP via Email or SMS
router.post('/send-otp', sendOtp);

// POST /api/auth/verify-otp → Validate 6-digit OTP code
router.post('/verify-otp', verifyOtp);

// POST /api/auth/reset-password-otp → Update password after OTP verification
router.post('/reset-password-otp', resetPasswordWithOtp);




// ============================================================
// PROTECTED ROUTES
// authenticateUser middleware runs before the controller.
// If token is missing/invalid, middleware blocks the request.
// If token is valid, req.user is attached and controller runs.
// ============================================================

// GET /api/auth/profile → Get authenticated user's profile
router.get('/profile', authenticateUser, getProfile);

// POST /api/auth/logout → Logout authenticated user
router.post('/logout', authenticateUser, logout);

module.exports = router;
