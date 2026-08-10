/**
 * AuthContext — Phase 2 Milestone 2
 *
 * Provides Firebase Authentication state and Magic Link helpers.
 *
 * Enhancements over Milestone 1:
 *  - `authError` — set when a magic link confirm fails or a non-admin
 *    email is detected; cleared via `clearAuthError()`
 *  - Non-admin auto-signout — if `confirmMagicLink` succeeds but the
 *    returned user's email is NOT on the whitelist, the user is signed
 *    out immediately before any navigation occurs.
 */

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { type User } from 'firebase/auth'
import {
  sendMagicLink,
  confirmMagicLink,
  signOut,
  subscribeToAuthState,
  isAdminEmail,
} from '@services/firebase/auth'

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

export interface AuthContextValue {
  /** Currently signed-in Firebase user, or null if unauthenticated. */
  user: User | null

  /** True while the initial auth state is being resolved. */
  loading: boolean

  /** True when user is non-null AND their email is on the admin whitelist. */
  isAdmin: boolean

  /**
   * Set when:
   *  - A magic link confirm fails (expired / already used / wrong link)
   *  - A user signs in with a non-whitelisted email (they are signed back out)
   * Cleared by `clearAuthError()`.
   */
  authError: string | null

  /** Clears `authError`. Call before retrying sign-in. */
  clearAuthError: () => void

  /** Sends a Magic Link. Rejects if email is not on the whitelist. */
  sendMagicLink: (email: string) => Promise<void>

  /**
   * Completes Magic Link sign-in from the callback URL.
   * Returns the signed-in User on success.
   * If the user's email is not on the whitelist, signs them out and
   * sets `authError` before rejecting.
   */
  confirmMagicLink: (emailHint?: string | null) => Promise<User>

  /** Signs the current user out. */
  logout: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const AuthContext = createContext<AuthContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Subscribe to Firebase auth state on mount — handles session persistence
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSendMagicLink = useCallback(
    (email: string) => sendMagicLink(email),
    []
  )

  const handleConfirmMagicLink = useCallback(
    async (emailHint?: string | null): Promise<User> => {
      const signedInUser = await confirmMagicLink(emailHint)

      // Immediately check whitelist — sign out if not authorised
      if (!signedInUser.email || !isAdminEmail(signedInUser.email)) {
        await signOut()
        const msg =
          'Access denied. This email address is not authorised to access the admin area.'
        setAuthError(msg)
        throw new Error(msg)
      }

      setUser(signedInUser)
      return signedInUser
    },
    []
  )

  const handleLogout = useCallback(async () => {
    await signOut()
    setUser(null)
  }, [])

  const clearAuthError = useCallback(() => setAuthError(null), [])

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const isAdmin = Boolean(user?.email && isAdminEmail(user.email))

  const value: AuthContextValue = {
    user,
    loading,
    isAdmin,
    authError,
    clearAuthError,
    sendMagicLink: handleSendMagicLink,
    confirmMagicLink: handleConfirmMagicLink,
    logout: handleLogout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
