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
const { signup, login, getProfile, logout } = require('../controllers/authController');

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
