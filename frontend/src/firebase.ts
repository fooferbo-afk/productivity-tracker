/**
 * Firebase configuration and initialization.
 * 
 * Initializes Firebase Auth with the configured providers.
 */

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
}

/**
 * Create a new account with email and password
 */
export async function signUpWithEmail(email: string, password: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}

/**
 * Get the current user's ID token
 */
export async function getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

export type { User };
