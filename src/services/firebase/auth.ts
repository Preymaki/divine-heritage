/**
 * Firebase Authentication Service
 *
 * Wraps Firebase Auth methods for the Magic Link (Email Link) sign-in flow.
 * All functions are pure async utilities — no React state here.
 *
 * Magic Link flow:
 *  1. Call `sendMagicLink(email)` → Firebase emails a sign-in link
 *  2. User clicks the link → app loads at VITE_APP_URL
 *  3. Call `confirmMagicLink(email, href)` on the callback page/route
 *
 * The signed-in user's email is validated against VITE_ADMIN_EMAIL_WHITELIST
 * before resolving — this is a client-side guard only. Enforce access server-
 * side (Firestore Security Rules / Cloud Functions) for production security.
 */

import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
  type ActionCodeSettings,
} from 'firebase/auth'
import { auth } from './config'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Local storage key used to persist the email between send and callback. */
export const EMAIL_STORAGE_KEY = 'dh:magicLinkEmail'

/**
 * Allowed admin emails, parsed from the env variable.
 * Stored as lower-cased strings for case-insensitive comparison.
 */
const WHITELIST: string[] = (import.meta.env.VITE_ADMIN_EMAIL_WHITELIST ?? '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when the given email is in the admin whitelist. */
export function isAdminEmail(email: string): boolean {
  return WHITELIST.includes(email.trim().toLowerCase())
}

// ---------------------------------------------------------------------------
// Magic Link — send
// ---------------------------------------------------------------------------

/**
 * Sends a Magic Link sign-in email to the specified address.
 *
 * The link redirects back to `VITE_APP_URL/admin/auth/callback` so the app
 * can complete the sign-in on return.
 *
 * Saves the email to localStorage so `confirmMagicLink` can retrieve it if
 * the user opens the link in the same browser.
 *
 * @throws {Error} If the email is not on the admin whitelist.
 * @throws {FirebaseError} On any Firebase Auth error.
 */
export async function sendMagicLink(email: string): Promise<void> {
  if (!isAdminEmail(email)) {
    throw new Error(
      `Sign-in not permitted for ${email}. Contact the site administrator.`
    )
  }

  const appUrl = import.meta.env.VITE_APP_URL ?? window.location.origin

  const actionCodeSettings: ActionCodeSettings = {
    // URL the user is redirected to after clicking the link
    url: `${appUrl}/admin/auth/callback`,
    // Required: must be true for email-link sign-in
    handleCodeInApp: true,
  }

  await sendSignInLinkToEmail(auth, email, actionCodeSettings)

  // Persist email so the callback can complete sign-in without asking again
  window.localStorage.setItem(EMAIL_STORAGE_KEY, email)
}

// ---------------------------------------------------------------------------
// Magic Link — confirm
// ---------------------------------------------------------------------------

/**
 * Completes the Magic Link sign-in.
 *
 * Call this on the `/admin/auth/callback` route, passing the current page URL.
 * If `email` is not provided, falls back to the value saved in localStorage
 * (works when the user opens the link in the same browser).
 *
 * @param emailHint  Email address; optional if localStorage value is present.
 * @param href       Full href of the callback URL (default: window.location.href)
 * @returns          The signed-in Firebase User.
 * @throws           If the link is invalid, expired, or email cannot be found.
 */
export async function confirmMagicLink(
  emailHint?: string | null,
  href: string = window.location.href
): Promise<User> {
  if (!isSignInWithEmailLink(auth, href)) {
    throw new Error('Invalid or expired sign-in link.')
  }

  const email =
    emailHint ??
    window.localStorage.getItem(EMAIL_STORAGE_KEY) ??
    ''

  if (!email) {
    throw new Error(
      'Could not determine the sign-in email. ' +
      'Please enter your email address to complete sign-in.'
    )
  }

  const result = await signInWithEmailLink(auth, email, href)

  // Clean up persisted email
  window.localStorage.removeItem(EMAIL_STORAGE_KEY)

  return result.user
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

/** Signs the current user out of Firebase Auth. */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

// ---------------------------------------------------------------------------
// Auth state observer
// ---------------------------------------------------------------------------

/**
 * Subscribes to Firebase auth state changes.
 * Returns the unsubscribe function — call it on component unmount.
 *
 * @example
 * const unsub = subscribeToAuthState((user) => setUser(user))
 * return () => unsub()
 */
export function subscribeToAuthState(
  callback: (user: User | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback)
}
