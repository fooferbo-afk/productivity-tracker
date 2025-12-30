/**
 * LoginPage.
 * 
 * Full-screen login experience with branding.
 * Redirects authenticated users to dashboard.
 */

import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated, selectAuthStatus } from '../store/slices/authSlice';
import './LoginPage.css';

export function LoginPage() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const status = useAppSelector(selectAuthStatus);

    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // Show loading while checking auth status
    if (status === 'loading' || status === 'unknown') {
        return (
            <div className="login-page login-page--loading">
                <div className="auth-loading__spinner" />
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-page__container">
                <div className="login-page__branding">
                    <div className="login-page__logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h2 className="login-page__app-name">Productivity Tracker</h2>
                    <p className="login-page__tagline">For Allied Health Professionals</p>
                </div>

                <LoginForm />
            </div>
        </div>
    );
}
