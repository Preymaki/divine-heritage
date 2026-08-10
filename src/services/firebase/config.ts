/**
 * Firebase App Initialisation
 *
 * Initialises the Firebase app once (guarded by getApps()) and exports
 * the three service instances used across the application:
 *   - auth     → Firebase Authentication
 *   - db       → Cloud Firestore
 *   - storage  → Cloud Storage
 *
 * All config values are read from Vite environment variables (`VITE_` prefix)
 * so they are available in the browser bundle without exposing them in source.
 *
 * To configure locally: copy `.env.example` → `.env.local` and fill values.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

// ---------------------------------------------------------------------------
// Firebase client config — sourced entirely from environment variables
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validate required config keys in development to surface missing env vars early
if (import.meta.env.DEV) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v || v === 'REPLACE_ME')
    .map(([k]) => `VITE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`)

  if (missing.length > 0) {
    console.warn(
      '[Firebase] Missing or placeholder environment variables detected.\n' +
      'Copy .env.example → .env.local and fill in your Firebase project values.\n' +
      'Missing: ' + missing.join(', ')
    )
  }
}

// ---------------------------------------------------------------------------
// Singleton initialisation — safe for hot-module-reload and strict mode
// ---------------------------------------------------------------------------
const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp()

// ---------------------------------------------------------------------------
// Service exports
// ---------------------------------------------------------------------------
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
export const storage: FirebaseStorage = getStorage(app)

export default app
