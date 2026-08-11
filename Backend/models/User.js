// ============================================================
// User.js — User Model with Validation & Security
// ============================================================
// This model defines the User schema for MongoDB.
// It includes:
// - Field validation rules
// - Password hashing (bcrypt)
// - Instance methods for password comparison
// - Timestamps for auditing
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ============================================================
// USER SCHEMA DEFINITION
// ============================================================
const userSchema = new mongoose.Schema(
    {
        // ========================================
        // NAME
        // User's full name (e.g., "John Doe")
        // ========================================
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,                           // Remove whitespace
            minlength: [3, 'Name must be at least 3 characters long'],
            maxlength: [50, 'Name cannot exceed 50 characters']
        },

        // ========================================
        // EMAIL
        // Primary identifier for login
        // Must be unique across the database
        // ========================================
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,                         // Enforces uniqueness
            lowercase: true,                      // Converts to lowercase before saving
            trim: true,                           // Remove whitespace
            validate: {
                validator: function(email) {
                    // RFC 5322 standard email validation regex
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                },
                message: 'Please provide a valid email address'
            }
        },

        // ========================================
        // PASSWORD
        // Stored as bcrypt hash (never plain text)
        // select: false → excluded from queries by default
        // This prevents accidental password exposure
        // ========================================
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters long'],
            select: false                         // Never return password in queries
        },

        // ========================================
        // ROLE
        // Used for authorization & access control
        // - "user" → regular user (default)
        // - "admin" → admin privileges
        // Enables role-based route protection
        // ========================================
        role: {
            type: String,
            enum: {
                values: ['user', 'admin'],
                message: 'Role must be either user or admin'
            },
            default: 'user'
        },

        // ========================================
        // IS ACTIVE
        // Soft-delete flag or account suspension
        // Instead of deleting users, mark them inactive
        // Preserves data integrity & audit trail
        // ========================================
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        // ========================================
        // SCHEMA OPTIONS
        // ========================================
        timestamps: true                          // Auto-creates createdAt & updatedAt
    }
);

// ============================================================
// PRE-SAVE MIDDLEWARE — PASSWORD HASHING
// ============================================================
// Runs automatically before saving a User document.
// Hashes the password using bcrypt if:
// 1. User is being created (new signup)
// 2. Password field is being modified (password reset)
//
// Does NOT hash if password wasn't changed (e.g., updating name/email).
// This prevents double-hashing the already-hashed password.
//
// bcrypt.genSalt(10) → generates a random salt with 10 rounds
// bcrypt.hash(password, salt) → creates hash from password + salt
// ============================================================
userSchema.pre('save', async function() {
    // 'this' refers to the current user document being saved
    const user = this;

    // Skip hashing if password wasn't modified
    if (!user.isModified('password')) {
        return;
    }

    // 1. Generate a salt
    const salt = await bcrypt.genSalt(10);

    // 2. Hash the plain-text password with the salt
    const hashedPassword = await bcrypt.hash(user.password, salt);

    // 3. Replace plain-text password with the hash
    user.password = hashedPassword;
});

// ============================================================
// INSTANCE METHOD — PASSWORD COMPARISON
// ============================================================
// comparePassword(candidatePassword)
//
// Used during login to verify if the provided password matches
// the stored hashed password.
//
// bcrypt.compare() automatically:
// 1. Extracts the salt from the stored hash
// 2. Hashes the candidate password with that salt
// 3. Compares the two hashes
//
// Parameters:
//   candidatePassword (string) — plain-text password from login form
//
// Returns:
//   boolean — true if passwords match, false otherwise
//
// Example usage in controller:
//   const isMatch = await user.comparePassword('password123');
//   if (isMatch) { // login successful }
// ============================================================
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // 'this.password' is the hashed password stored in DB
        // bcrypt.compare() handles the comparison securely
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        throw new Error('Password comparison failed');
    }
};

// ============================================================
// CREATE & EXPORT MODEL
// ============================================================
const User = mongoose.model('User', userSchema);
module.exports = User;
