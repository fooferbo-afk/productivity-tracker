/**
 * AuthProvider component.
 * 
 * Listens to Firebase auth state changes and syncs with Redux.
 * Wraps the app to provide auth context.
 */

import { useEffect, type ReactNode } from 'react';
import { onAuthChange, getIdToken } from '../../firebase';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    setFirebaseUser,
    registerTherapist,
    selectAuthStatus
} from '../../store/slices/authSlice';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectAuthStatus);

    useEffect(() => {
        // Subscribe to Firebase auth state changes
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get fresh token
                    const token = await getIdToken();
                    if (token) {
                        dispatch(setFirebaseUser({ uid: firebaseUser.uid, token }));
                        // Register/fetch therapist profile from backend
                        dispatch(registerTherapist());
                    }
                } catch (error) {
                    console.error('Failed to get auth token:', error);
                    dispatch(setFirebaseUser(null));
                }
            } else {
                dispatch(setFirebaseUser(null));
            }
        });

        return () => unsubscribe();
    }, [dispatch]);

    // Show loading state while checking auth
    if (status === 'unknown') {
        return (
            <div className="auth-loading">
                <div className="auth-loading__spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    return <>{children}</>;
}
