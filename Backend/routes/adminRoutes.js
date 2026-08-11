// ============================================================
// adminRoutes.js — Admin Route Definitions
// ============================================================
// All routes in this file require:
// 1. authenticateUser — Valid JWT token
// 2. authorizeRoles('admin') — User role must be "admin"
//
// Routes are thin — they only define HTTP method, path,
// middleware chain, and controller function.
// All business logic lives in adminController.js.
// ============================================================

const express = require('express');
const router = express.Router();

// Import authentication and authorization middleware
const { authenticateUser } = require('../jwt');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Import admin controller functions
const {
    getAllUsers,
    getUserById,
    updateUserRole,
    updateUserStatus,
    deleteUser
} = require('../controllers/adminController');

// ============================================================
// MIDDLEWARE CHAIN EXPLANATION
// ============================================================
// Every route here has this middleware chain:
//
// authenticateUser → authorizeRoles('admin') → controller
//       ↓                      ↓                      ↓
//   Verify JWT          Check role="admin"    Execute logic
//
// If JWT is missing/invalid:
//   → 401 Unauthorized (blocked by authenticateUser)
//
// If JWT is valid but role != "admin":
//   → 403 Forbidden (blocked by authorizeRoles)
//
// If both pass:
//   → Controller executes
// ============================================================

// ============================================================
// USER MANAGEMENT ROUTES
// ============================================================

// GET /api/admin/users
// Retrieve all users in the system
// Response: Array of user objects
router.get('/users', 
    authenticateUser, 
    authorizeRoles('admin'), 
    getAllUsers
);

// GET /api/admin/users/:id
// Retrieve a specific user by ID
// Response: Single user object
router.get('/users/:id', 
    authenticateUser, 
    authorizeRoles('admin'), 
    getUserById
);

// PUT /api/admin/users/:id/role
// Update a user's role (e.g., promote to admin)
// Request Body: { "role": "admin" } or { "role": "user" }
// Response: Updated user object
router.put('/users/:id/role', 
    authenticateUser, 
    authorizeRoles('admin'), 
    updateUserRole
);

// PUT /api/admin/users/:id/status
// Activate or deactivate a user account
// Request Body: { "isActive": true } or { "isActive": false }
// Response: Updated user object
router.put('/users/:id/status', 
    authenticateUser, 
    authorizeRoles('admin'), 
    updateUserStatus
);

// DELETE /api/admin/users/:id
// Permanently delete a user
// Response: Success confirmation
router.delete('/users/:id', 
    authenticateUser, 
    authorizeRoles('admin'), 
    deleteUser
);

module.exports = router;
