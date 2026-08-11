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
// Body: { name, email, password }
// Returns: { success, data: { token, user } }
// ============================================================
export const signup = async (name, email, password) => {
    const response = await api.post('/signup', { name, email, password });
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
