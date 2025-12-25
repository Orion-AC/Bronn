/**
 * Firebase Configuration and Authentication Utilities
 * 
 * This module initializes Firebase and provides auth helper functions.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User,
    type UserCredential,
    type Auth,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';

// =============================================================================
// Firebase Configuration
// =============================================================================

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

try {
    console.log('Firebase Config Debug:', {
        apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'UNDEFINED',
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId
    });
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
}

export { auth };

// =============================================================================
// Authentication Functions
// =============================================================================

/**
 * Sign in with email and password
 * Returns the user credential and ID token
 */
export const loginWithEmail = async (
    email: string,
    password: string
): Promise<{ user: User; idToken: string }> => {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );
    const idToken = await userCredential.user.getIdToken();
    return { user: userCredential.user, idToken };
};

/**
 * Register a new user with email and password
 */
export const registerWithEmail = async (
    email: string,
    password: string,
    displayName?: string
): Promise<{ user: User; idToken: string }> => {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    // Update display name if provided
    if (displayName) {
        await updateProfile(userCredential.user, { displayName });
    }

    const idToken = await userCredential.user.getIdToken();
    return { user: userCredential.user, idToken };
};

/**
 * Sign in with Google OAuth
 */
export const loginWithGoogle = async (): Promise<{ user: User; idToken: string }> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const idToken = await userCredential.user.getIdToken();
    return { user: userCredential.user, idToken };
};

/**
 * Sign out the current user
 */
export const logout = async (): Promise<void> => {
    await firebaseSignOut(auth);
    // Clear any stored tokens
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

/**
 * Get the current user (or null if not authenticated)
 */
export const getCurrentUser = (): Promise<User | null> => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
};

/**
 * Get the current user's ID token
 * Returns null if no user is signed in
 */
export const getIdToken = async (forceRefresh = false): Promise<string | null> => {
    const user = auth.currentUser;
    if (user) {
        return user.getIdToken(forceRefresh);
    }
    return null;
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
};

/**
 * Subscribe to auth state changes
 * Returns an unsubscribe function
 */
export const onAuthStateChange = (
    callback: (user: User | null) => void
): (() => void) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Verify token with backend and sync user data
 */
export const verifyTokenWithBackend = async (
    idToken: string
): Promise<{
    user: {
        id: string;
        email: string;
        first_name: string | null;
        last_name: string | null;
        display_name: string | null;
        avatar_url: string | null;
    };
    activepieces_token: string | null;
}> => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const response = await fetch(`${backendUrl}/api/auth/verify-token`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Token verification failed');
    }

    return response.json();
};
