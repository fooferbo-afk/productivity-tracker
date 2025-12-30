/**
 * Redux store configuration.
 * 
 * Centralized store with typed hooks for use throughout the app.
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore non-serializable Firebase User in auth state
                ignoredActions: ['auth/setFirebaseUser'],
                ignoredPaths: ['auth.firebaseUser'],
            },
        }),
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
