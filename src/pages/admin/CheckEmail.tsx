/**
 * Check Your Email Page — /admin/check-email
 *
 * Shown immediately after the Magic Link is sent.
 * Lets the user know to check their inbox and optionally resend.
 */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MailOpen, RefreshCw, ArrowLeft } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'

export default function CheckEmail() {
  const location = useLocation()
  const { sendMagicLink } = useAuth()

  // Grab the email that was passed through navigation state
  const sentEmail = (location.state as { email?: string } | null)?.email ?? ''

  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)

  async function handleResend() {
    if (!sentEmail || resending) return
    setResending(true)
    setResendError(null)
    setResent(false)

    try {
      await sendMagicLink(sentEmail)
      setResent(true)
    } catch (err: unknown) {
      setResendError(
        err instanceof Error ? err.message : 'Failed to resend the link. Please try again.'
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-orb admin-auth-orb--1" aria-hidden="true" />
      <div className="admin-auth-orb admin-auth-orb--2" aria-hidden="true" />

      <div className="admin-auth-card admin-auth-card--wide">
        {/* Icon */}
        <div className="admin-auth-icon-circle admin-auth-icon-circle--accent">
          <MailOpen size={28} />
        </div>

        <div className="admin-auth-heading">
          <h1>Check your email</h1>
          <p>
            A secure sign-in link has been sent to{' '}
            {sentEmail ? (
              <strong className="admin-email-highlight">{sentEmail}</strong>
            ) : (
              'your email address'
            )}
            .
          </p>
        </div>

        <ul className="admin-steps-list" role="list">
          <li>
            <span className="admin-step-num" aria-hidden="true">1</span>
            Open the email in your inbox (or spam/junk folder)
          </li>
          <li>
            <span className="admin-step-num" aria-hidden="true">2</span>
            Click the <strong>Sign in to Divine Heritage</strong> button
          </li>
          <li>
            <span className="admin-step-num" aria-hidden="true">3</span>
            You'll be signed in automatically. The link is valid for 1 hour.
          </li>
        </ul>

        {/* Resend section */}
        <div className="admin-resend-section">
          <p className="admin-resend-label">Didn't receive it?</p>

          {resent && (
            <div role="status" className="admin-success-banner">
              ✓ A new link has been sent to {sentEmail}
            </div>
          )}

          {resendError && (
            <div role="alert" className="admin-error-banner">
              {resendError}
            </div>
          )}

          {sentEmail && (
            <button
              type="button"
              id="admin-resend-link"
              onClick={handleResend}
              disabled={resending}
              className="admin-btn-ghost"
            >
              <RefreshCw
                size={15}
                className={resending ? 'admin-icon-spin' : ''}
                aria-hidden="true"
              />
              {resending ? 'Resending…' : 'Resend magic link'}
            </button>
          )}
        </div>

        <p className="admin-auth-footer">
          <Link to="/admin/login" className="admin-auth-link">
            <ArrowLeft size={14} />
            Use a different email
          </Link>
        </p>
      </div>
    </div>
  )
}
