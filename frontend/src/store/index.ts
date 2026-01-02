/**
 * Redux store configuration.
 * 
 * Centralized store with typed hooks for use throughout the app.
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import facilitiesReducer from './slices/facilitiesSlice';
import sessionsReducer from './slices/sessionsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        facilities: facilitiesReducer,
        sessions: sessionsReducer,
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
