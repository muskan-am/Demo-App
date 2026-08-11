// ============================================================
// server.js — Entry point for the MERN Authentication API
// ============================================================

// 1. Load environment variables FIRST, before any other imports.
//    This ensures process.env values are available everywhere.
require('dotenv').config();

// 2. Import the database connection.
//    Simply requiring db.js executes the mongoose.connect() call inside it.
//    This was missing before — the server was starting without a DB connection.
require('./db');

const express = require('express');
const cors = require('cors');

const app = express();

// ============================================================
// CORS Configuration
// Allows the React frontend (Vite dev server) to make requests
// to this backend. Vite defaults to 5173 but increments to
// 5174, 5175, etc. if the port is already in use.
// ============================================================
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ============================================================
// Body Parsing Middleware
// express.json()         → parses incoming JSON request bodies (req.body)
// express.urlencoded()   → parses URL-encoded form data (HTML form submissions)
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Request Logger Middleware
// Logs every incoming request with a timestamp and the URL.
// Useful for debugging during development.
// ============================================================
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// ============================================================
// Health Check Route
// GET / → confirms the server is up and running.
// The React frontend or any monitoring tool can ping this.
// ============================================================
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'MERN Authentication API is running'
    });
});

// ============================================================
// Authentication Routes
// All auth-related routes (signup, login, profile, logout)
// are mounted under /api/auth.
// e.g. POST /api/auth/signup, POST /api/auth/login
// ============================================================
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ============================================================
// Admin Routes
// Admin-only routes for user management.
// All routes require authenticateUser + authorizeRoles('admin').
// Mounted under /api/admin.
// e.g. GET /api/admin/users, DELETE /api/admin/users/:id
// ============================================================
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// ============================================================
// 404 Handler
// Catches any request that didn't match a defined route above.
// Must be placed AFTER all valid routes.
// ============================================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// ============================================================
// Global Error Handler
// Express recognizes this as an error handler because it has
// 4 parameters (err, req, res, next).
// Any route that calls next(err) will land here.
// Also catches unexpected runtime errors passed via next().
// ============================================================
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ============================================================
// Start Server
// PORT is read from .env — falls back to 5000 if not set.
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
