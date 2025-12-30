/**
 * LoginForm component.
 * 
 * Handles email/password and Google OAuth sign-in.
 * Displays validation errors and loading states.
 */

import { useState, type FormEvent } from 'react';
import {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle
} from '../../firebase';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError, selectAuthError, selectAuthStatus } from '../../store/slices/authSlice';
import './LoginForm.css';

type Mode = 'signin' | 'signup';

export function LoginForm() {
    const dispatch = useAppDispatch();
    const authError = useAppSelector(selectAuthError);
    const authStatus = useAppSelector(selectAuthStatus);

    const [mode, setMode] = useState<Mode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const isFormLoading = isLoading || authStatus === 'loading';

    const validateForm = (): boolean => {
        if (!email.trim()) {
            setLocalError('Email is required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setLocalError('Please enter a valid email');
            return false;
        }
        if (!password) {
            setLocalError('Password is required');
            return false;
        }
        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return false;
        }
        if (mode === 'signup' && password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        dispatch(clearError());

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            if (mode === 'signin') {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
            // Auth state change will be handled by AuthProvider
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Authentication failed';
            // Clean up Firebase error messages
            const cleanMessage = message
                .replace('Firebase: ', '')
                .replace(/\(auth\/[^)]+\)/, '')
                .trim();
            setLocalError(cleanMessage || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLocalError(null);
        dispatch(clearError());
        setIsLoading(true);

        try {
            await signInWithGoogle();
            // Auth state change will be handled by AuthProvider
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Google sign-in failed';
            setLocalError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setLocalError(null);
        dispatch(clearError());
        setConfirmPassword('');
    };

    const displayError = localError || authError;

    return (
        <div className="login-form">
            <div className="login-form__header">
                <h1 className="login-form__title">
                    {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="login-form__subtitle">
                    {mode === 'signin'
                        ? 'Sign in to track your productivity'
                        : 'Start tracking your productivity today'}
                </p>
            </div>

            {displayError && (
                <div className="login-form__error" role="alert">
                    {displayError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="login-form__form">
                <div className="login-form__field">
                    <label htmlFor="email" className="login-form__label">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="login-form__input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        disabled={isFormLoading}
                        autoComplete="email"
                    />
                </div>

                <div className="login-form__field">
                    <label htmlFor="password" className="login-form__label">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="login-form__input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isFormLoading}
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    />
                </div>

                {mode === 'signup' && (
                    <div className="login-form__field">
                        <label htmlFor="confirmPassword" className="login-form__label">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="login-form__input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={isFormLoading}
                            autoComplete="new-password"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="login-form__submit"
                    disabled={isFormLoading}
                >
                    {isFormLoading
                        ? 'Please wait...'
                        : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
            </form>

            <div className="login-form__divider">
                <span>or</span>
            </div>

            <button
                type="button"
                className="login-form__google"
                onClick={handleGoogleSignIn}
                disabled={isFormLoading}
            >
                <svg className="login-form__google-icon" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                Continue with Google
            </button>

            <p className="login-form__toggle">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                    type="button"
                    className="login-form__toggle-btn"
                    onClick={toggleMode}
                    disabled={isFormLoading}
                >
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
            </p>
        </div>
    );
}
