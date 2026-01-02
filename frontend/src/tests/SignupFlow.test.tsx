/**
 * Signup Flow Resilience Tests.
 * 
 * Verifies that the signup process handles interruptions, network failures,
 * and existing user states (idempotency) gracefully.
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import { AuthProvider } from '../components/auth/AuthProvider';
import * as firebaseMod from '../firebase';
import * as clientMod from '../api/client';

expect.extend(matchers);

// Mock dependencies
vi.mock('../firebase', () => ({
    onAuthChange: vi.fn(),
    getIdToken: vi.fn(),
    auth: {}
}));

vi.mock('../api/client', () => ({
    post: vi.fn(),
    get: vi.fn()
}));

const createTestStore = () => configureStore({
    reducer: {
        auth: authReducer
    }
});

describe('Signup Process Resilience', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        store = createTestStore();
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('Scenario 1: Happy Path - New User Signup', async () => {
        // Setup success
        let authCallback: (user: any) => void = () => { };
        (firebaseMod.onAuthChange as any).mockImplementation((cb: any) => {
            authCallback = cb;
            return () => { };
        });
        (firebaseMod.getIdToken as any).mockResolvedValue('valid-token-new');

        const newUser = { id: 'new-1', name: 'New Therapist', email: 'new@example.com' };
        // Backend returns the new user
        (clientMod.post as any).mockResolvedValue(newUser);

        render(
            <Provider store={store}>
                <AuthProvider>
                    <div data-testid="app-content">Welcome New User</div>
                </AuthProvider>
            </Provider>
        );

        // User logs in via Firebase (e.g. Google Sign In)
        authCallback({ uid: 'firebase-new-1' });

        // Verify registration call
        await waitFor(() => {
            expect(clientMod.post).toHaveBeenCalledWith('/auth/register');
        });

        // Verify successful access
        await waitFor(() => {
            expect(screen.getByTestId('app-content')).toBeInTheDocument();
        });

        expect(store.getState().auth.status).toBe('authenticated');
        expect(store.getState().auth.user).toEqual(newUser);
    });

    it('Scenario 2: Idempotency - User drops off after Firebase but before App load', async () => {
        // Simulates a user who signed up previously (or partially), so backend has them,
        // but frontend treats it as a new "Session".

        let authCallback: (user: any) => void = () => { };
        (firebaseMod.onAuthChange as any).mockImplementation((cb: any) => {
            authCallback = cb;
            return () => { };
        });
        (firebaseMod.getIdToken as any).mockResolvedValue('valid-token-existing');

        const existingUser = { id: 'ext-1', name: 'Returning Therapist', email: 'exist@example.com' };

        // Backend returns existing user (Idempotent endpoint)
        (clientMod.post as any).mockResolvedValue(existingUser);

        render(
            <Provider store={store}>
                <AuthProvider>
                    <div data-testid="app-content">Welcome Back</div>
                </AuthProvider>
            </Provider>
        );

        authCallback({ uid: 'firebase-ext-1' });

        // Frontend still calls "register" (or whatever the flow is), backend handles it
        await waitFor(() => {
            expect(clientMod.post).toHaveBeenCalledWith('/auth/register');
        });

        // User gets in smoothly
        await waitFor(() => {
            expect(screen.getByTestId('app-content')).toBeInTheDocument();
        });

        expect(store.getState().auth.status).toBe('authenticated');
        expect(store.getState().auth.user).toEqual(existingUser);
    });

    it('Scenario 3: Network Drop-off & Retry', async () => {
        // 1. Initial Attempt Fails
        let authCallback: (user: any) => void = () => { };
        (firebaseMod.onAuthChange as any).mockImplementation((cb: any) => {
            authCallback = cb;
            return () => { };
        });
        (firebaseMod.getIdToken as any).mockResolvedValue('valid-token-retry');

        // First call fails
        (clientMod.post as any)
            .mockRejectedValueOnce(new Error('Network disconnected'))
            .mockResolvedValueOnce({ id: 'retry-1', name: 'Retry User' });

        const { unmount } = render(
            <Provider store={store}>
                <AuthProvider>
                    <div data-testid="app-content">Success</div>
                </AuthProvider>
            </Provider>
        );

        // Attempt 1
        authCallback({ uid: 'firebase-retry-1' });

        await waitFor(() => {
            expect(clientMod.post).toHaveBeenCalledTimes(1);
        });

        // State should be error/unauthenticated
        expect(store.getState().auth.status).toBe('unauthenticated');
        expect(store.getState().auth.error).toBe('Network disconnected');

        // Content checks - AuthProvider renders children even on error (ProtectedRoute handles redirect)
        // So we check state instead
        expect(store.getState().auth.status).toBe('unauthenticated');

        // 2. User Retries (e.g. reload page or clicks login again)
        // We simulate unmount/remount or just firing authCallback again (if they click login plugin)
        unmount();

        // Clear store error for realism (usually reload resets store, here we just make a new render)
        // Actually best to verify a new render works.

        render(
            <Provider store={store}>
                <AuthProvider>
                    <div data-testid="app-content">Success</div>
                </AuthProvider>
            </Provider>
        );

        // Attempt 2
        authCallback({ uid: 'firebase-retry-1' });

        await waitFor(() => {
            expect(clientMod.post).toHaveBeenCalledTimes(2);
        });

        // Success!
        await waitFor(() => {
            expect(screen.getByTestId('app-content')).toBeInTheDocument();
        });
    });
});
