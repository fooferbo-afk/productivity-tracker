/**
 * Auth slice.
 * 
 * Manages authentication state with Firebase.
 * Status flow: unknown -> loading -> authenticated | unauthenticated
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthStatus, Therapist } from '../../types';
import { post, get } from '../../api/client';

const initialState: AuthState = {
    status: 'unknown',
    user: null,
    firebaseUid: null,
    token: null,
    error: null,
};

/**
 * Register or fetch the therapist profile from backend after Firebase auth.
 */
export const registerTherapist = createAsyncThunk<
    Therapist,
    void,
    { rejectValue: string }
>(
    'auth/registerTherapist',
    async (_, { rejectWithValue }) => {
        try {
            const therapist = await post<Therapist>('/auth/register');
            return therapist;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to register';
            return rejectWithValue(message);
        }
    }
);

/**
 * Fetch current therapist profile.
 */
export const fetchCurrentUser = createAsyncThunk<
    Therapist,
    void,
    { rejectValue: string }
>(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const therapist = await get<Therapist>('/auth/me');
            return therapist;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch user';
            return rejectWithValue(message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * Set auth status (used during initialization).
         */
        setStatus(state, action: PayloadAction<AuthStatus>) {
            state.status = action.payload;
        },

        /**
         * Set Firebase user info after auth state change.
         */
        setFirebaseUser(state, action: PayloadAction<{ uid: string; token: string } | null>) {
            if (action.payload) {
                state.firebaseUid = action.payload.uid;
                state.token = action.payload.token;
                state.status = 'loading'; // Will fetch therapist profile next
            } else {
                state.firebaseUid = null;
                state.token = null;
                state.user = null;
                state.status = 'unauthenticated';
            }
            state.error = null;
        },

        /**
         * Clear error message.
         */
        clearError(state) {
            state.error = null;
        },

        /**
         * Reset auth state on logout.
         */
        logout(state) {
            state.status = 'unauthenticated';
            state.user = null;
            state.firebaseUid = null;
            state.token = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Register therapist
        builder.addCase(registerTherapist.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        });
        builder.addCase(registerTherapist.fulfilled, (state, action) => {
            state.status = 'authenticated';
            state.user = action.payload;
            state.error = null;
        });
        builder.addCase(registerTherapist.rejected, (state, action) => {
            state.status = 'unauthenticated';
            state.error = action.payload || 'Registration failed';
        });

        // Fetch current user
        builder.addCase(fetchCurrentUser.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        });
        builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
            state.status = 'authenticated';
            state.user = action.payload;
            state.error = null;
        });
        builder.addCase(fetchCurrentUser.rejected, (state, action) => {
            state.status = 'unauthenticated';
            state.error = action.payload || 'Failed to fetch user';
        });
    },
});

export const { setStatus, setFirebaseUser, clearError, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors - typed to work with store's RootState
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
    state.auth.status === 'authenticated';


