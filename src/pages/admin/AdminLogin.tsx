/**
 * Admin Login Page — /admin/login
 *
 * Step 1 of the Magic Link flow.
 * The owner enters their email; we call sendMagicLink then navigate to /admin/check-email.
 */

import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, ArrowRight, Shield, Sparkles } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { sendMagicLink, loading: authLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSending(true)

    try {
      await sendMagicLink(email.trim())
      navigate('/admin/check-email', { state: { email: email.trim() } })
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send the sign-in link. Please try again.'
      )
    } finally {
      setSending(false)
    }
  }

  const isLoading = authLoading || sending

  return (
    <div className="admin-auth-page">
      {/* Ambient background orbs */}
      <div className="admin-auth-orb admin-auth-orb--1" aria-hidden="true" />
      <div className="admin-auth-orb admin-auth-orb--2" aria-hidden="true" />

      <div className="admin-auth-card">
        {/* Brand badge */}
        <div className="admin-auth-badge">
          <Shield size={18} />
          <span>Admin Portal</span>
        </div>

        {/* Heading */}
        <div className="admin-auth-heading">
          <h1>Welcome back</h1>
          <p>Enter your email and we'll send you a secure sign-in link — no password needed.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-form-group">
            <label htmlFor="admin-email" className="admin-form-label">
              Email address
            </label>
            <div className="admin-input-wrapper">
              <Mail size={16} className="admin-input-icon" aria-hidden="true" />
              <input
                id="admin-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                className="admin-input"
                aria-describedby={error ? 'admin-login-error' : undefined}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              id="admin-login-error"
              role="alert"
              className="admin-error-banner"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            id="admin-login-submit"
            disabled={isLoading || !email.trim()}
            className="admin-btn-primary"
          >
            {sending ? (
              <>
                <span className="admin-btn-spinner" aria-hidden="true" />
                Sending link…
              </>
            ) : (
              <>
                <Sparkles size={16} aria-hidden="true" />
                Send Magic Link
                <ArrowRight size={16} className="admin-btn-arrow" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="admin-auth-footer">
          <Link to="/" className="admin-auth-link">
            ← Back to main site
          </Link>
        </p>
      </div>
    </div>
  )
}
