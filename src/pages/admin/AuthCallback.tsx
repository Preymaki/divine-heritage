/**
 * Auth Callback Page — /admin/auth/callback
 *
 * Firebase redirects the user to this route after they click the Magic Link.
 * This page:
 *  1. Detects if the current URL is a valid email-link sign-in URL
 *  2. Calls confirmMagicLink() (which also performs whitelist validation)
 *  3. On success → navigates to /admin/dashboard
 *  4. On failure → shows an error with options to retry or go back to login
 *
 * If the user opens the link in a different browser (no localStorage email),
 * they are prompted to re-enter their email address to complete sign-in.
 */

import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { isSignInWithEmailLink } from 'firebase/auth'
import { auth } from '@services/firebase/config'
import { EMAIL_STORAGE_KEY } from '@services/firebase/auth'
import { Loader2, AlertTriangle, CheckCircle, Mail } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'

type Phase =
  | 'detecting'   // checking if current URL is a valid magic link
  | 'confirming'  // calling Firebase confirmMagicLink
  | 'email-prompt' // cross-device flow: user must supply their email
  | 'success'
  | 'error'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { confirmMagicLink } = useAuth()

  const [phase, setPhase] = useState<Phase>('detecting')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Cross-device flow state
  const [crossDeviceEmail, setCrossDeviceEmail] = useState('')
  const [crossDeviceSending, setCrossDeviceSending] = useState(false)

  // ------------------------------------------------------------------
  // On mount: decide whether this URL is a valid magic link
  // ------------------------------------------------------------------
  useEffect(() => {
    const href = window.location.href
    const isLink = isSignInWithEmailLink(auth, href)

    if (!isLink) {
      setPhase('error')
      setErrorMsg('This URL is not a valid sign-in link. It may have already been used or has expired.')
      return
    }

    const storedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY)

    if (storedEmail) {
      // Same-browser flow — complete sign-in automatically
      completeSignIn(storedEmail)
    } else {
      // Cross-device flow — ask the user for their email
      setPhase('email-prompt')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ------------------------------------------------------------------
  // Core sign-in logic
  // ------------------------------------------------------------------
  async function completeSignIn(emailHint?: string) {
    setPhase('confirming')
    try {
      await confirmMagicLink(emailHint)
      setPhase('success')
      // Short delay so user can see the success state before redirect
      setTimeout(() => navigate('/admin/dashboard', { replace: true }), 1200)
    } catch (err: unknown) {
      setPhase('error')
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Sign-in failed. The link may have expired or already been used.'
      )
    }
  }

  // ------------------------------------------------------------------
  // Cross-device form submit
  // ------------------------------------------------------------------
  function handleCrossDeviceSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!crossDeviceEmail.trim() || crossDeviceSending) return
    setCrossDeviceSending(true)
    completeSignIn(crossDeviceEmail.trim()).finally(() =>
      setCrossDeviceSending(false)
    )
  }

  // ------------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------------
  if (phase === 'detecting' || phase === 'confirming') {
    return (
      <div className="admin-auth-page">
        <div className="admin-auth-orb admin-auth-orb--1" aria-hidden="true" />
        <div className="admin-auth-orb admin-auth-orb--2" aria-hidden="true" />
        <div className="admin-auth-card admin-auth-card--centered">
          <div className="admin-spinner-large" aria-label="Authenticating" role="status">
            <Loader2 size={40} className="admin-icon-spin" aria-hidden="true" />
          </div>
          <h1 className="admin-auth-status-title">
            {phase === 'detecting' ? 'Verifying link…' : 'Signing you in…'}
          </h1>
          <p className="admin-auth-status-body">
            Please wait while we securely authenticate your session.
          </p>
        </div>
      </div>
    )
  }

  if (phase === 'success') {
    return (
      <div className="admin-auth-page">
        <div className="admin-auth-orb admin-auth-orb--1" aria-hidden="true" />
        <div className="admin-auth-orb admin-auth-orb--2" aria-hidden="true" />
        <div className="admin-auth-card admin-auth-card--centered">
          <div className="admin-auth-icon-circle admin-auth-icon-circle--success">
            <CheckCircle size={32} />
          </div>
          <h1 className="admin-auth-status-title">Authenticated!</h1>
          <p className="admin-auth-status-body">
            Redirecting you to the dashboard…
          </p>
          <div className="admin-progress-bar" aria-hidden="true">
            <div className="admin-progress-fill" />
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'email-prompt') {
    return (
      <div className="admin-auth-page">
        <div className="admin-auth-orb admin-auth-orb--1" aria-hidden="true" />
        <div className="admin-auth-orb admin-auth-orb--2" aria-hidden="true" />
        <div className="admin-auth-card">
          <div className="admin-auth-icon-circle">
            <Mail size={24} />
          </div>
          <div className="admin-auth-heading">
            <h1>Confirm your email</h1>
            <p>
              It looks like you opened this link on a different device. Enter the email
              address you used to request the magic link to complete sign-in.
            </p>
          </div>

          <form onSubmit={handleCrossDeviceSubmit} noValidate>
            <div className="admin-form-group">
              <label htmlFor="cross-device-email" className="admin-form-label">
                Email address
              </label>
              <div className="admin-input-wrapper">
                <Mail size={16} className="admin-input-icon" aria-hidden="true" />
                <input
                  id="cross-device-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="your@email.com"
                  value={crossDeviceEmail}
                  onChange={e => setCrossDeviceEmail(e.target.value)}
                  disabled={crossDeviceSending}
                  className="admin-input"
                />
              </div>
            </div>

            <button
              type="submit"
              id="cross-device-submit"
              disabled={crossDeviceSending || !crossDeviceEmail.trim()}
              className="admin-btn-primary"
            >
              {crossDeviceSending ? (
                <>
                  <Loader2 size={15} className="admin-icon-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Complete sign-in'
              )}
            </button>
          </form>

          <p className="admin-auth-footer">
            <Link to="/admin/login" className="admin-auth-link">
              ← Request a new link
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // phase === 'error'
  return (
    <div className="admin-auth-page">
      <div className="admin-auth-orb admin-auth-orb--1" aria-hidden="true" />
      <div className="admin-auth-orb admin-auth-orb--2" aria-hidden="true" />
      <div className="admin-auth-card">
        <div className="admin-auth-icon-circle admin-auth-icon-circle--error">
          <AlertTriangle size={28} />
        </div>
        <div className="admin-auth-heading">
          <h1>Sign-in failed</h1>
          <p>{errorMsg ?? 'An unexpected error occurred. Please try again.'}</p>
        </div>

        <div className="admin-error-actions">
          <Link
            to="/admin/login"
            id="auth-error-retry"
            className="admin-btn-primary"
          >
            Try again
          </Link>
          <Link
            to="/"
            id="auth-error-home"
            className="admin-btn-ghost"
          >
            Back to main site
          </Link>
        </div>
      </div>
    </div>
  )
}
