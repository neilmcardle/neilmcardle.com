'use client'

import { useState } from 'react'
import { useWeprayAuth } from '../hooks/useWeprayAuth'

export function AuthForm() {
  const { signIn, signUp, authError, clearError } = useWeprayAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    clearError()
    try {
      if (mode === 'signup') {
        const { error, needsVerification } = await signUp(email, password)
        if (!error && needsVerification) setVerificationSent(true)
        // If email confirmation is disabled, the auth state listener picks up
        // the new session and the parent page redirects via useEffect.
      } else {
        await signIn(email, password)
        // Same: signed-in state propagates via the auth context.
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (verificationSent) {
    return (
      <div className="wp-card wp-card-paper" style={{ maxWidth: 420 }}>
        <h2 className="wp-h2" style={{ marginBottom: 8 }}>Check your inbox</h2>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
          We sent a confirmation link to <strong>{email}</strong>. Click it to finish creating your account.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="wp-card" style={{ maxWidth: 420, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => { setMode('signin'); clearError() }}
          className={`wp-btn ${mode === 'signin' ? '' : 'wp-btn-secondary'}`}
          style={{ flex: 1 }}
        >Sign in</button>
        <button
          type="button"
          onClick={() => { setMode('signup'); clearError() }}
          className={`wp-btn ${mode === 'signup' ? '' : 'wp-btn-secondary'}`}
          style={{ flex: 1 }}
        >Sign up</button>
      </div>

      <label className="wp-label" htmlFor="wp-email">Email</label>
      <input
        id="wp-email"
        type="email"
        required
        autoComplete="email"
        className="wp-input"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <label className="wp-label" htmlFor="wp-password">Password</label>
      <input
        id="wp-password"
        type="password"
        required
        minLength={6}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        className="wp-input"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      {authError && (
        <div role="alert" style={{ fontSize: 13, color: 'var(--wp-clay-deep)' }}>
          {authError}
        </div>
      )}

      <button type="submit" className="wp-btn" disabled={submitting}>
        {submitting ? '...' : mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>
    </form>
  )
}
