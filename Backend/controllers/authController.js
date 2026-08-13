// ============================================================
// authController.js — Production-Ready Authentication Logic
// ============================================================
// All authentication operations with proper validation,
// security, error handling, and status codes.
// ==========================================================

const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../jwt');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/email');




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
        const { name, email, password, phone } = req.body;

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
            phone: phone ? phone.trim() : null,
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
// GOOGLE LOGIN — Authenticate using Google ID Token
// ============================================================
// POST /api/auth/google
//
// Request Body:
//   { credential }  (Google ID Token)
//
// Process:
// 1. Verify credential token with Google OAuth2Client
// 2. Extract Google user identity (googleId, email, name, picture)
// 3. Search DB by email
// 4. If user exists -> verify active, update googleId/picture if needed
// 5. If user doesn't exist -> create user with role="user"
// 6. Generate application JWT using generateToken(user)
// 7. Return JWT token + user info
// ============================================================
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google ID token credential is required'
            });
        }

        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID') {
            console.error('[GOOGLE AUTH ERROR] GOOGLE_CLIENT_ID is not configured in backend environment.');
            return res.status(500).json({
                success: false,
                message: 'Google Authentication is not configured on the server. Please set GOOGLE_CLIENT_ID in backend .env'
            });
        }

        // Verify the Google ID token
        const client = new OAuth2Client(googleClientId);
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: credential,
                audience: googleClientId
            });
        } catch (verifyErr) {
            console.error('[GOOGLE VERIFY ERROR]', verifyErr.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired Google token'
            });
        }

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token payload received from Google'
            });
        }

        const { sub: googleId, email, name, picture } = payload;
        const normalizedEmail = email.toLowerCase().trim();

        // Search user in database by email
        let user = await User.findOne({ email: normalizedEmail });

        if (user) {
            // Check account status
            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Account has been deactivated'
                });
            }

            // Link googleId or profilePicture if not set
            let isModified = false;
            if (!user.googleId) {
                user.googleId = googleId;
                isModified = true;
            }
            if (picture && user.profilePicture !== picture) {
                user.profilePicture = picture;
                isModified = true;
            }
            if (user.authProvider !== 'google' && !user.authProvider) {
                user.authProvider = 'local';
            }
            if (isModified) {
                await user.save();
            }
        } else {
            // Create new Google user with safe default role 'user'
            user = new User({
                name: (name || email.split('@')[0]).trim(),
                email: normalizedEmail,
                googleId,
                profilePicture: picture,
                authProvider: 'google',
                role: 'user' // Server-enforced role, never set by frontend
            });

            await user.save();
        }

        // Generate application's standard JWT token
        const token = generateToken(user);

        // Return token and user payload
        res.status(200).json({
            success: true,
            message: 'Google authentication successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    authProvider: user.authProvider
                }
            }
        });

    } catch (err) {
        console.error('[GOOGLE LOGIN ERROR]', err.message);
        res.status(500).json({
            success: false,
            message: 'Google login failed. Please try again.'
        });
    }
};

// ============================================================
// FORGOT PASSWORD — Generate reset token & send reset link
// ============================================================
// POST /api/auth/forgot-password
//
// Request Body:
//   { email }
//
// Process:
// 1. Validate email input
// 2. Find user in MongoDB
// 3. Anti-enumeration security: return generic success even if user not found
// 4. Generate 32-byte crypto token and store SHA-256 hash in DB
// 5. Expiration time set to 15 minutes (15 * 60 * 1000)
// 6. Send reset URL via Nodemailer
// ============================================================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Generic anti-enumeration response to prevent email discovery attacks
        const genericMessage = 'If an account with that email exists, a password reset link has been sent.';

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            // Anti-enumeration: return generic success response without exposing whether user exists
            return res.status(200).json({
                success: true,
                message: genericMessage
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account has been deactivated'
            });
        }

        // Check if user is a Google-only account without local password
        if (user.authProvider === 'google' && !user.password) {
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Account Registration Info — MERN Auth',
                    isGoogleUser: true
                });
            } catch (emailErr) {
                console.error('[EMAIL ERROR - GOOGLE USER]', emailErr.message);
            }
            return res.status(200).json({
                success: true,
                message: genericMessage
            });
        }

        // 1. Generate random 32-byte reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // 2. Hash token using SHA-256 before saving to DB
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // 3. Set token & 15-minute expiration
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        // 4. Construct frontend reset link
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        // 5. Send reset email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                resetUrl,
                isGoogleUser: false
            });

            return res.status(200).json({
                success: true,
                message: genericMessage
            });

        } catch (emailErr) {
            console.error('[EMAIL SENDING ERROR]', emailErr.message);

            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again later.'
            });
        }

    } catch (err) {
        console.error('[FORGOT PASSWORD ERROR]', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to process password reset request. Please try again.'
        });
    }
};

// ============================================================
// RESET PASSWORD — Validate token & update user password
// ============================================================
// POST /api/auth/reset-password/:token
//
// Request Params: token (raw unhashed token from URL)
// Request Body:   { password }
//
// Process:
// 1. Hash incoming token with SHA-256
// 2. Search DB for matching resetPasswordToken & unexpired resetPasswordExpire
// 3. Validate new password length (min 8 chars)
// 4. Update user.password (pre-save hook automatically hashes with bcrypt)
// 5. Clear resetPasswordToken & resetPasswordExpire
// 6. Save user & return success
// ============================================================
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'New password is required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Hash token using SHA-256 to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user matching token & check expiration > current time
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Your password reset link is invalid or has expired. Please request a new reset link.'
            });
        }

        // Update password & clear reset fields
        // User schema pre-save hook automatically hashes user.password with bcrypt!
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully! You can now log in with your new password.'
        });

    } catch (err) {
        console.error('[RESET PASSWORD ERROR]', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password. Please try again.'
        });
    }
};

// ============================================================
// ============================================================
// SEND OTP — Generate 6-Digit OTP & Send via Email
// ============================================================
// POST /api/auth/send-otp
// Request Body: { target } (Email address)
// ============================================================
const sendOtp = async (req, res) => {
    try {
        const { target, email } = req.body;
        const targetEmail = (email || target || '').trim().toLowerCase();

        if (!targetEmail) {
            return res.status(400).json({
                success: false,
                message: 'Registered email address is required.'
            });
        }

        const genericMessage = 'If an account with that email address exists, an OTP verification code has been sent.';

        const user = await User.findOne({ email: targetEmail });

        if (!user) {
            console.log(`\n============================================================`);
            console.log(`[DEV OTP NOTICE] Password reset requested for: ${targetEmail}`);
            console.log(`[REASON]: This email is NOT YET registered in MongoDB.`);
            console.log(`[ACTION NEEDED]: Please register an account first at http://localhost:5173/signup`);
            console.log(`============================================================\n`);

            return res.status(200).json({
                success: true,
                message: genericMessage
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account has been deactivated'
            });
        }

        // 1. Generate 6-digit random OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Hash OTP using SHA-256 before saving in DB
        const hashedOtp = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        // 3. Set OTP & 10-minute expiration
        user.resetOtp = hashedOtp;
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        // 4. Send OTP via Email
        await sendEmail({
            email: user.email,
            subject: 'Your Password Reset OTP Code',
            otp: otp
        });

        return res.status(200).json({
            success: true,
            message: genericMessage
        });

    } catch (err) {
        console.error('[SEND OTP ERROR]', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to send OTP verification code. Please try again.'
        });
    }
};

// ============================================================
// VERIFY OTP — Validate 6-Digit Code & Return Reset Token
// ============================================================
// POST /api/auth/verify-otp
// Request Body: { target, otp }
// ============================================================
const verifyOtp = async (req, res) => {
    try {
        const { target, email, otp } = req.body;
        const targetEmail = (email || target || '').trim().toLowerCase();

        if (!targetEmail || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Both registered email address and 6-digit OTP code are required.'
            });
        }

        const hashedOtp = crypto
            .createHash('sha256')
            .update(otp.trim())
            .digest('hex');

        // Find user by matching email, hashed OTP and resetOtpExpire > Date.now()
        const user = await User.findOne({
            email: targetEmail,
            resetOtp: hashedOtp,
            resetOtpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP code. Please enter a valid 6-digit code or click Resend.'
            });
        }

        // Generate temporary 15-minute resetSessionToken
        const resetSessionToken = crypto.randomBytes(32).toString('hex');
        const hashedSessionToken = crypto
            .createHash('sha256')
            .update(resetSessionToken)
            .digest('hex');

        // Clear OTP & assign resetPasswordToken
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        user.resetPasswordToken = hashedSessionToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully!',
            resetSessionToken: resetSessionToken
        });

    } catch (err) {
        console.error('[VERIFY OTP ERROR]', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify OTP code. Please try again.'
        });
    }
};

// ============================================================
// RESET PASSWORD WITH OTP TOKEN — Set new password
// ============================================================
// POST /api/auth/reset-password-otp
// Request Body: { resetSessionToken, password }
// ============================================================
const resetPasswordWithOtp = async (req, res) => {
    try {
        const { resetSessionToken, password } = req.body;

        if (!resetSessionToken || !password) {
            return res.status(400).json({
                success: false,
                message: 'Reset session token and new password are required.'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long.'
            });
        }

        const hashedSessionToken = crypto
            .createHash('sha256')
            .update(resetSessionToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedSessionToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Your reset session has expired or is invalid. Please restart the OTP process.'
            });
        }

        // Update password & clear token fields
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;

        if (user.authProvider === 'google') {
            user.authProvider = 'local';
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully! You can now log in with your new password.'
        });

    } catch (err) {
        console.error('[RESET PASSWORD OTP ERROR]', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to update password. Please try again.'
        });
    }
};

// ============================================================
// Exports
// ============================================================
module.exports = {
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
};



