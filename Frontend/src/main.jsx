// ============================================================
// main.jsx — Application Entry Point
// ============================================================
// This is the root of the React application.
// It mounts the app into the #root div in index.html.
//
// Wrapper order (inside → out):
// 1. <App />              — route definitions and pages
// 2. <AuthProvider>       — provides auth state to all routes/pages
// 3. <BrowserRouter>      — enables React Router navigation
// 4. <StrictMode>         — highlights potential issues in development
//
// Order matters:
// - BrowserRouter must wrap everything that uses routing hooks
// - AuthProvider must wrap everything that uses useAuth()
// - Both must wrap App since App contains routes and pages
// ============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
