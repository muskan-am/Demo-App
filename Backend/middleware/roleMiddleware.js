// ============================================================
// roleMiddleware.js — Role-Based Access Control (RBAC)
// ============================================================
// Middleware to restrict route access based on user roles.
// Works in combination with authenticateUser middleware.
//
// Flow:
// 1. authenticateUser verifies JWT and attaches req.user = { userId, role }
// 2. authorizeRoles checks if req.user.role is in allowed roles
// 3. If allowed → next() (proceed to route handler)
// 4. If denied → 403 Forbidden
// ============================================================

// ============================================================
// authorizeRoles(...roles)
// ============================================================
// Factory function that returns a middleware.
// Accepts one or more role names as arguments.
//
// Parameters:
//   ...roles (string[]) — Array of allowed roles
//
// Returns:
//   Express middleware function (req, res, next)
//
// Example Usage:
//
//   // Only admins can access
//   router.delete('/users/:id', authenticateUser, authorizeRoles('admin'), deleteUser);
//
//   // Both admins and moderators can access
//   router.put('/posts/:id', authenticateUser, authorizeRoles('admin', 'moderator'), editPost);
//
//   // All authenticated users can access (less useful, but valid)
//   router.get('/dashboard', authenticateUser, authorizeRoles('user', 'admin'), getDashboard);
//
// How it works:
// 1. authorizeRoles('admin') is called first
// 2. Returns a middleware function that closes over the 'roles' array
// 3. When the route is hit, the returned middleware checks req.user.role
// 4. If match found → next()
// 5. If no match → 403 Forbidden
//
// Important:
// - MUST be used AFTER authenticateUser middleware
// - authenticateUser attaches req.user = { userId, role }
// - If used before authenticateUser, req.user will be undefined → crash
// ============================================================
const authorizeRoles = (...roles) => {
    // This function returns the actual middleware
    return (req, res, next) => {
        // ========================================
        // 1. VERIFY MIDDLEWARE ORDER
        // req.user should exist (set by authenticateUser)
        // If it doesn't, authenticateUser wasn't called first
        // ========================================
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login first.'
            });
        }

        // ========================================
        // 2. CHECK IF USER'S ROLE IS ALLOWED
        // req.user.role comes from JWT payload
        // roles array comes from function arguments
        // Example: roles = ['admin', 'moderator']
        // ========================================
        const userRole = req.user.role;

        if (!roles.includes(userRole)) {
            // User's role is NOT in the allowed roles array
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to access this resource.'
            });
        }

        // ========================================
        // 3. ROLE AUTHORIZED → PROCEED
        // User's role is in the allowed list
        // Call next() to pass control to route handler
        // ========================================
        next();
    };
};

// ============================================================
// Exports
// ============================================================
module.exports = { authorizeRoles };
