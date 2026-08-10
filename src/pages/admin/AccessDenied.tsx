/**
 * Access Denied Page — /admin/access-denied
 *
 * Shown when a user successfully authenticates with Firebase but their
 * email is NOT on the VITE_ADMIN_EMAIL_WHITELIST.
 * The user is automatically signed out by AuthContext before landing here.
 */

import { Link } from 'react-router-dom'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'

export default function AccessDenied() {
  const { authError } = useAuth()

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-orb admin-auth-orb--1 admin-auth-orb--error" aria-hidden="true" />
      <div className="admin-auth-orb admin-auth-orb--2 admin-auth-orb--error" aria-hidden="true" />

      <div className="admin-auth-card admin-auth-card--centered">
        {/* Icon */}
        <div className="admin-auth-icon-circle admin-auth-icon-circle--error">
          <ShieldX size={32} />
        </div>

        <div className="admin-auth-heading">
          <h1>Access Denied</h1>
          <p>
            {authError ??
              'This email address does not have permission to access the admin dashboard.'}
          </p>
        </div>

        <div className="admin-access-denied-detail">
          <p>
            If you believe this is a mistake, please contact the site owner or
            verify that you are using the correct email address associated with
            the administrator account.
          </p>
        </div>

        <div className="admin-error-actions">
          <Link
            to="/admin/login"
            id="access-denied-try-again"
            className="admin-btn-primary"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Try a different email
          </Link>
          <Link
            to="/"
            id="access-denied-home"
            className="admin-btn-ghost"
          >
            <Home size={15} aria-hidden="true" />
            Go to main site
          </Link>
        </div>
      </div>
    </div>
  )
}
