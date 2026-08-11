// ============================================================
// adminController.js — Admin Management Operations
// ============================================================
// Controllers for admin-only operations:
// - View all users
// - View single user
// - Update user role
// - Activate/deactivate accounts
// - Delete users
//
// Security: All routes protected by authenticateUser + authorizeRoles('admin')
// ============================================================

const User = require('../models/User');

// ============================================================
// GET ALL USERS
// ============================================================
// GET /api/admin/users
//
// Returns list of all users in the system.
// Only accessible by users with role="admin".
//
// Query Parameters (optional):
//   ?page=1&limit=10 — Pagination (future enhancement)
//   ?role=user — Filter by role (future enhancement)
//
// Response:
//   200 OK → { success: true, data: { users, total } }
//   500 Server Error → { success: false, message }
//
// Security:
// ✓ Passwords excluded automatically (select: false in schema)
// ✓ Only admins can access (authorizeRoles middleware)
// ============================================================
const getAllUsers = async (req, res) => {
    try {
        // Fetch all users from database
        // Password is automatically excluded (select: false in schema)
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                users,
                total: users.length
            }
        });

    } catch (err) {
        console.error('[GET ALL USERS ERROR]', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users. Please try again.'
        });
    }
};

// ============================================================
// GET USER BY ID
// ============================================================
// GET /api/admin/users/:id
//
// Returns detailed information about a specific user.
// Only accessible by admins.
//
// URL Parameters:
//   :id — User's MongoDB ObjectId
//
// Response:
//   200 OK → { success: true, data: { user } }
//   404 Not Found → { success: false, message: "User not found" }
//   500 Server Error → { success: false, message }
//
// Use Cases:
// - Admin viewing user details
// - Admin verifying user information before taking action
// ============================================================
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find user by ID
        // Password excluded automatically (select: false)
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { user }
        });

    } catch (err) {
        console.error('[GET USER BY ID ERROR]', err.message);
        
        // Handle invalid ObjectId format
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch user. Please try again.'
        });
    }
};

// ============================================================
// UPDATE USER ROLE
// ============================================================
// PUT /api/admin/users/:id/role
//
// Updates a user's role (e.g., promote user to admin).
// Only accessible by admins.
//
// URL Parameters:
//   :id — User's MongoDB ObjectId
//
// Request Body:
//   { "role": "admin" } or { "role": "user" }
//
// Validation:
// ✓ role must be either "user" or "admin"
// ✓ User must exist
//
// Response:
//   200 OK → { success: true, message, data: { user } }
//   400 Bad Request → { success: false, message }
//   404 Not Found → { success: false, message }
//   500 Server Error → { success: false, message }
//
// Security:
// ✓ Only admins can change roles
// ✓ Password never returned in response
// ============================================================
const updateUserRole = async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        // ========================================
        // 1. VALIDATE ROLE
        // Only "user" and "admin" are allowed
        // ========================================
        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Role is required'
            });
        }

        const allowedRoles = ['user', 'admin'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Allowed roles: user, admin'
            });
        }

        // ========================================
        // 2. FIND AND UPDATE USER
        // ========================================
        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { 
                new: true,              // Return updated document
                runValidators: true     // Run schema validation
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // ========================================
        // 3. RETURN SUCCESS
        // ========================================
        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            data: { user }
        });

    } catch (err) {
        console.error('[UPDATE USER ROLE ERROR]', err.message);
        
        // Handle invalid ObjectId
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update user role. Please try again.'
        });
    }
};

// ============================================================
// UPDATE USER STATUS (Activate/Deactivate)
// ============================================================
// PUT /api/admin/users/:id/status
//
// Activates or deactivates a user account.
// Deactivated users cannot login (checked in login controller).
//
// URL Parameters:
//   :id — User's MongoDB ObjectId
//
// Request Body:
//   { "isActive": true } or { "isActive": false }
//
// Use Cases:
// - Suspend problematic users
// - Reactivate previously suspended accounts
// - Soft delete (mark inactive instead of deleting)
//
// Response:
//   200 OK → { success: true, message, data: { user } }
//   400 Bad Request → { success: false, message }
//   404 Not Found → { success: false, message }
//   500 Server Error → { success: false, message }
//
// Security:
// ✓ Only admins can change account status
// ✓ Password never returned
// ============================================================
const updateUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { isActive } = req.body;

        // ========================================
        // 1. VALIDATE isActive
        // Must be boolean (true or false)
        // ========================================
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be a boolean (true or false)'
            });
        }

        // ========================================
        // 2. FIND AND UPDATE USER
        // ========================================
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive },
            { 
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // ========================================
        // 3. RETURN SUCCESS
        // ========================================
        const statusMessage = isActive ? 'activated' : 'deactivated';
        
        res.status(200).json({
            success: true,
            message: `User account ${statusMessage} successfully`,
            data: { user }
        });

    } catch (err) {
        console.error('[UPDATE USER STATUS ERROR]', err.message);
        
        // Handle invalid ObjectId
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update user status. Please try again.'
        });
    }
};

// ============================================================
// DELETE USER
// ============================================================
// DELETE /api/admin/users/:id
//
// Permanently deletes a user from the database.
// This is a destructive operation and cannot be undone.
//
// URL Parameters:
//   :id — User's MongoDB ObjectId
//
// Response:
//   200 OK → { success: true, message }
//   404 Not Found → { success: false, message }
//   500 Server Error → { success: false, message }
//
// Best Practice:
// Consider using "soft delete" (set isActive=false) instead
// to preserve data and audit trails.
//
// Security:
// ✓ Only admins can delete users
// ✓ Admins should not be able to delete themselves (future enhancement)
// ============================================================
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // ========================================
        // OPTIONAL: Prevent admin from deleting themselves
        // Uncomment to enable this safety check
        // ========================================
        // if (userId === req.user.userId) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'You cannot delete your own account'
        //     });
        // }

        // ========================================
        // FIND AND DELETE USER
        // ========================================
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // ========================================
        // RETURN SUCCESS
        // ========================================
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (err) {
        console.error('[DELETE USER ERROR]', err.message);
        
        // Handle invalid ObjectId
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to delete user. Please try again.'
        });
    }
};

// ============================================================
// Exports
// ============================================================
module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    updateUserStatus,
    deleteUser
};
