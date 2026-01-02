/**
 * Auth Flow Integration Tests.
 * 
 * Tests the AuthProvider and complete login sequence.
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { Provider } from 'react-redux';

expect.extend(matchers);
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../store/slices/authSlice';
import { AuthProvider } from '../components/auth/AuthProvider';
import * as firebaseMod from '../firebase';
import * as clientMod from '../api/client';

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

describe('Auth Flow Integration', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        store = createTestStore();
        vi.clearAllMocks();
    });

    it('shows loading state initially', () => {
        // Mock onAuthChange to just subscribe
        (firebaseMod.onAuthChange as any).mockReturnValue(() => { });

        render(
            <Provider store={store}>
                <AuthProvider>
                    <div>Child Content</div>
                </AuthProvider>
            </Provider>
        );

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('completes login flow when Firebase user detected', async () => {
        // Setup mocks
        const mockUnsubscribe = vi.fn();
        let authCallback: (user: any) => void = () => { };

        (firebaseMod.onAuthChange as any).mockImplementation((cb: any) => {
            authCallback = cb;
            return mockUnsubscribe;
        });

        (firebaseMod.getIdToken as any).mockResolvedValue('fake-token');

        const mockTherapist = { id: '1', name: 'Test User', email: 'test@example.com' };
        (clientMod.post as any).mockResolvedValue(mockTherapist);

        render(
            <Provider store={store}>
                <AuthProvider>
                    <div data-testid="protected-content">Child Content</div>
                </AuthProvider>
            </Provider>
        );

        // Simulate Firebase auth event
        authCallback({ uid: 'firebase-123' });

        // Checks
        await waitFor(() => {
            expect(firebaseMod.getIdToken).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(clientMod.post).toHaveBeenCalledWith('/auth/register');
        });

        // Should eventually render children
        await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        });

        // Check Store State
        const state = store.getState().auth;
        expect(state.status).toBe('authenticated');
        expect(state.user).toEqual(mockTherapist);
    });

    it('handle auth failure gracefully', async () => {
        let authCallback: (user: any) => void = () => { };
        (firebaseMod.onAuthChange as any).mockImplementation((cb: any) => {
            authCallback = cb;
            return () => { };
        });

        (firebaseMod.getIdToken as any).mockResolvedValue('fake-token');
        (clientMod.post as any).mockRejectedValue(new Error('Network Error'));

        render(
            <Provider store={store}>
                <AuthProvider>
                    <div>Child Content</div>
                </AuthProvider>
            </Provider>
        );

        authCallback({ uid: 'firebase-123' });

        await waitFor(() => {
            expect(clientMod.post).toHaveBeenCalled();
        });

        // Should NOT render children? 
        // Based on AuthProvider, it renders children only if status != unknown. 
        // But if register fails, status -> unauthenticated.
        // ProtectedRoute handles redirect. AuthProvider just renders children.
        // So children ARE rendered, but 'auth' state is unauthenticated.

        const state = store.getState().auth;
        expect(state.status).toBe('unauthenticated');
        expect(state.error).toBe('Network Error');
    });
});
