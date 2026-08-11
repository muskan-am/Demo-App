// ============================================================
// authController.js — Production-Ready Authentication Logic
// ============================================================
// All authentication operations with proper validation,
// security, error handling, and status codes.
// ============================================================

const User = require('../models/User');
const { generateToken } = require('../jwt');

// ============================================================
// SIGNUP — Register new user
// ============================================================
// POST /api/auth/signup
//
// Request Body:
//   { name, email, password }
//
// Validation:
// ✓ All fields required
// ✓ Email format validation (regex)
// ✓ Password minimum 8 characters
// ✓ Duplicate email check
//
// Security:
// ✓ Role is ALWAYS set to "user" server-side
// ✓ Frontend cannot pass "admin" role
// ✓ Password auto-hashed by User model pre-save hook
// ✓ Password NEVER returned in response
//
// Status Codes:
//   201 Created    → User registered successfully
//   400 Bad Request → Missing fields or invalid format
//   409 Conflict   → Email already exists
//   500 Server Error → Database or unexpected error
// ============================================================
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ========================================
        // 1. VALIDATE REQUIRED FIELDS
        // ========================================
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required (name, email, password)'
            });
        }

        // ========================================
        // 2. VALIDATE EMAIL FORMAT
        // Regex: basic email validation
        // ========================================
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // ========================================
        // 3. VALIDATE PASSWORD LENGTH
        // Minimum 8 characters
        // ========================================
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // ========================================
        // 4. CHECK DUPLICATE EMAIL
        // Email is unique in schema but we return
        // a user-friendly error here
        // ========================================
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        // ========================================
        // 5. CREATE USER
        // Security: Role is hardcoded to "user"
        // Even if frontend sends role: "admin",
        // it will be ignored
        // Password will be auto-hashed by the
        // User model's pre-save hook
        // ========================================
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: 'user'  // ← Always "user", never from req.body
        });

        const savedUser = await newUser.save();

        // ========================================
        // 6. GENERATE JWT TOKEN
        // Token contains { userId, role }
        // ========================================
        const token = generateToken(savedUser);

        // ========================================
        // 7. RETURN SUCCESS RESPONSE
        // Password is NEVER included in response
        // ========================================
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                token,
                user: {
                    id: savedUser._id,
                    name: savedUser.name,
                    email: savedUser.email,
                    role: savedUser.role
                }
            }
        });

    } catch (err) {
        console.error('[SIGNUP ERROR]', err.message);
        
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(err.errors)[0].message
            });
        }

        // Generic server error
        res.status(500).json({
            success: false,
            message: 'Failed to create account. Please try again.'
        });
    }
};

// ============================================================
// LOGIN — Authenticate user
// ============================================================
// POST /api/auth/login
//
// Request Body:
//   { email, password }
//
// Process:
// 1. Validate required fields
// 2. Find user by email
// 3. Explicitly fetch password (select: "+password")
// 4. Compare password with bcrypt
// 5. Check if account is active (isActive field)
// 6. Generate JWT token
// 7. Return user data + token
//
// Security:
// ✓ Generic error message for invalid credentials
//   (doesn't reveal if email exists)
// ✓ Password never returned in response
// ✓ Checks account status before allowing login
//
// Status Codes:
//   200 OK         → Login successful
//   400 Bad Request → Missing fields
//   401 Unauthorized → Invalid credentials
//   403 Forbidden  → Account deactivated
//   500 Server Error → Database or unexpected error
// ============================================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ========================================
        // 1. VALIDATE REQUIRED FIELDS
        // ========================================
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // ========================================
        // 2. FIND USER BY EMAIL
        // .select('+password') explicitly fetches
        // password field because select:false in
        // the User schema hides it by default
        // ========================================
        const user = await User.findOne({ 
            email: email.toLowerCase() 
        }).select('+password');

        // User not found
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // ========================================
        // 3. COMPARE PASSWORD
        // comparePassword is an instance method
        // defined in User model that uses bcrypt
        // ========================================
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // ========================================
        // 4. CHECK ACCOUNT STATUS
        // If isActive is false, block login
        // This enables account suspension
        // ========================================
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account has been deactivated'
            });
        }

        // ========================================
        // 5. GENERATE JWT TOKEN
        // ========================================
        const token = generateToken(user);

        // ========================================
        // 6. RETURN SUCCESS RESPONSE
        // Password is NEVER included
        // ========================================
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (err) {
        console.error('[LOGIN ERROR]', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to login. Please try again.'
        });
    }
};

// ============================================================
// GET PROFILE — Fetch authenticated user's profile
// ============================================================
// GET /api/auth/profile
// Protected Route (requires authenticateUser middleware)
//
// Request:
//   Headers: { Authorization: "Bearer <token>" }
//
// Process:
// 1. Extract userId from req.user (set by middleware)
// 2. Fetch user from database
// 3. Return user profile
//
// Security:
// ✓ Password automatically hidden (select: false in schema)
// ✓ Only authenticated users can access this route
//
// Status Codes:
//   200 OK         → Profile fetched successfully
//   404 Not Found  → User not found (token valid but user deleted)
//   500 Server Error → Database error
// ============================================================
const getProfile = async (req, res) => {
    try {
        // ========================================
        // 1. GET USER ID FROM JWT
        // authenticateUser middleware attaches:
        // req.user = { userId, role }
        // ========================================
        const userId = req.user.userId;

        // ========================================
        // 2. FETCH USER FROM DATABASE
        // Password is automatically excluded
        // because select: false in schema
        // ========================================
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // ========================================
        // 3. RETURN USER PROFILE
        // Password is NOT included in response
        // ========================================
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });

    } catch (err) {
        console.error('[GET PROFILE ERROR]', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile. Please try again.'
        });
    }
};

// ============================================================
// LOGOUT — Log out authenticated user
// ============================================================
// POST /api/auth/logout
// Protected Route (requires authenticateUser middleware)
//
// JWT is stateless — no server-side session exists.
// Logout is handled entirely on the client side by:
// 1. Removing token from localStorage/sessionStorage
// 2. Clearing authentication state (Context/Redux)
// 3. Redirecting to Login page
//
// This endpoint exists to:
// - Provide a consistent logout API
// - Enable future token blacklisting (if needed)
// - Log logout events (optional)
//
// Status Codes:
//   200 OK → Logout instruction sent
// ============================================================
const logout = async (req, res) => {
    try {
        // No server-side action required for JWT logout
        // Token invalidation happens on the client
        
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (err) {
        console.error('[LOGOUT ERROR]', err.message);
        res.status(500).json({
            success: false,
            message: 'Logout failed. Please try again.'
        });
    }
};

// ============================================================
// Exports
// ============================================================
module.exports = {
    signup,
    login,
    getProfile,
    logout
};
