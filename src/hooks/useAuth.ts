/**
 * useAuth hook
 *
 * Convenience hook for accessing AuthContext.
 * Must be used within an <AuthProvider> tree.
 *
 * @example
 * const { user, loading, isAdmin, authError, logout } = useAuth()
 */

import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '@contexts/AuthContext'

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)

  if (ctx === null) {
    throw new Error(
      'useAuth must be used within an <AuthProvider>. ' +
      'Ensure <AuthProvider> wraps your component tree in main.tsx.'
    )
  }

  return ctx
}
