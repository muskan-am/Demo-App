// ============================================================
// authService.js — Axios API calls for Authentication
// ============================================================
// All HTTP requests to the backend auth endpoints live here.
// Components never call axios directly — they always go through
// a service. This keeps API logic in one place.
// ============================================================

import axios from 'axios';

// Base URL for all API requests
// VITE_API_URL = http://localhost:5000/api (from .env)
// We append /auth here so all calls go to /api/auth/*
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;

// ============================================================
// Axios instance
// Pre-configured with the base URL.
// All requests from this instance automatically include it.
// ============================================================
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ============================================================
// Request Interceptor
// Automatically attaches JWT token to every request header.
// Reads token from localStorage before each call.
// ============================================================
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================================
// SIGNUP
// POST /api/auth/signup
// Body: { name, email, password, phone }
// Returns: { success, data: { token, user } }
// ============================================================
export const signup = async (name, email, password, phone = null) => {
    const response = await api.post('/signup', { name, email, password, phone });
    return response.data;
};

// ============================================================
// LOGIN
// POST /api/auth/login
// Body: { email, password }
// Returns: { success, data: { token, user } }
// ============================================================
export const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
};

// ============================================================
// GOOGLE LOGIN
// POST /api/auth/google
// Body: { credential }
// Returns: { success, data: { token, user } }
// ============================================================
export const googleLogin = async (credential) => {
    const response = await api.post('/google', { credential });
    return response.data;
};

// ============================================================
// FORGOT PASSWORD (EMAIL RESET LINK)
// POST /api/auth/forgot-password
// Body: { email }
// Returns: { success, message }
// ============================================================
export const forgotPassword = async (email) => {
    const response = await api.post('/forgot-password', { email });
    return response.data;
};

// ============================================================
// RESET PASSWORD (EMAIL RESET LINK)
// POST /api/auth/reset-password/:token
// Body: { password }
// Returns: { success, message }
// ============================================================
export const resetPassword = async (token, password) => {
    const response = await api.post(`/reset-password/${token}`, { password });
    return response.data;
};

// ============================================================
// SEND OTP (DUAL METHOD: EMAIL / PHONE)
// POST /api/auth/send-otp
// Body: { method: 'email' | 'phone', target }
// Returns: { success, message }
// ============================================================
export const sendOtp = async (method, target) => {
    const response = await api.post('/send-otp', { method, target });
    return response.data;
};

// ============================================================
// VERIFY OTP (VALIDATE 6-DIGIT CODE)
// POST /api/auth/verify-otp
// Body: { target, otp, method }
// Returns: { success, resetSessionToken }
// ============================================================
export const verifyOtp = async (target, otp, method) => {
    const response = await api.post('/verify-otp', { target, otp, method });
    return response.data;
};

// ============================================================
// RESET PASSWORD WITH OTP TOKEN
// POST /api/auth/reset-password-otp
// Body: { resetSessionToken, password }
// Returns: { success, message }
// ============================================================
export const resetPasswordWithOtp = async (resetSessionToken, password) => {
    const response = await api.post('/reset-password-otp', { resetSessionToken, password });
    return response.data;
};




// ============================================================
// GET PROFILE
// GET /api/auth/profile
// Headers: Authorization: Bearer <token>
// Returns: { success, data: { user } }
// ============================================================
export const getProfile = async () => {
    const response = await api.get('/profile');
    return response.data;
};

// ============================================================
// LOGOUT
// POST /api/auth/logout
// Headers: Authorization: Bearer <token>
// Returns: { success, message }
// ============================================================
export const logout = async () => {
    const response = await api.post('/logout');
    return response.data;
};
