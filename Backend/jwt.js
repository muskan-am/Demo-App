
const jwt = require('jsonwebtoken');
const generateToken = (user) => {
    const payload = {
        userId: user._id,
        role: user.role || 'user'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// ============================================================
// authenticateUser(req, res, next)
// Middleware that protects routes requiring authentication.
//
// How it works:
// 1. Extracts Authorization header from request
// 2. Validates "Bearer <token>" format
// 3. Verifies token signature and expiry
// 4. Attaches decoded payload to req.user
//
// Expected Header Format:
//   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
//
// On Success:
//   req.user = { userId, role }
//   calls next() to proceed to the route handler
//
// On Failure:
//   returns 401 with descriptive JSON error
// ============================================================
const authenticateUser = (req, res, next) => {
    // 1. Check if Authorization header exists
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Token missing.'
        });
    }


    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token format. Use: Bearer <token>'
        });
    }

    const token = parts[1];

    // 3. Verify token signature and expiry
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach decoded payload to req.user
        //    Routes can now access req.user.userId and req.user.role
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        // 5. Pass control to the next middleware/route handler
        next();

    } catch (err) {
        // Handle JWT-specific errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }

        // Catch-all for unexpected errors
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

// ============================================================
// Exports
// ============================================================
module.exports = {
    generateToken,
    authenticateUser
};
