'use client'

import { useEffect } from 'react'
import { useWeprayAuth } from './hooks/useWeprayAuth'
import { AuthForm } from './components/AuthForm'

export default function WeprayLandingPage() {
  const { user, loading } = useWeprayAuth()

  useEffect(() => {
    if (!loading && user) window.location.replace('/wepray/home')
  }, [loading, user])

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 56 }}>
        <div
          style={{
            fontFamily: 'var(--font-serif), Georgia, serif',
            fontVariationSettings: "'opsz' 36, 'SOFT' 100, 'wght' 500",
            fontStyle: 'italic',
            fontSize: 22,
            letterSpacing: '-0.01em',
          }}
        >
          WePray
        </div>
        <a href="/" className="wp-link" style={{ fontSize: 13 }}>← neilmcardle.com</a>
      </header>

      <section style={{ display: 'grid', gap: 48, gridTemplateColumns: 'minmax(0, 1fr)', alignItems: 'start' }}>
        <div>
          <p className="wp-eyebrow" style={{ marginBottom: 16 }}>A place to pray together</p>
          <h1 className="wp-h1" style={{ marginBottom: 24, maxWidth: 14 + 'ch' }}>
            Pray together, <span className="wp-serif-italic">for each other.</span>
          </h1>
          <p className="wp-lede" style={{ maxWidth: '40ch', marginBottom: 32 }}>
            A small, private circle for shared prayer. Bring in friends and family by invite, share what needs prayer, and tap a button when you do.
          </p>

          <ul style={{ display: 'grid', gap: 0, paddingLeft: 0, listStyle: 'none', maxWidth: '40ch', borderTop: '1px solid var(--wp-rule)' }}>
            <li style={{ display: 'grid', gridTemplateColumns: '5rem 1fr', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--wp-rule)', fontSize: 15, lineHeight: 1.5 }}>
              <span className="wp-eyebrow">Private</span>
              <span>Circles are invite-only. Nothing is public.</span>
            </li>
            <li style={{ display: 'grid', gridTemplateColumns: '5rem 1fr', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--wp-rule)', fontSize: 15, lineHeight: 1.5 }}>
              <span className="wp-eyebrow">Tagged</span>
              <span>Praise, Urgent, or Ongoing — and an optional verse.</span>
            </li>
            <li style={{ display: 'grid', gridTemplateColumns: '5rem 1fr', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--wp-rule)', fontSize: 15, lineHeight: 1.5 }}>
              <span className="wp-eyebrow">Counted</span>
              <span>Tap "I prayed" — your friends see the count quietly grow.</span>
            </li>
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <AuthForm />
        </div>
      </section>

      <footer style={{ marginTop: 80, paddingTop: 24, borderTop: '1px solid var(--wp-rule)', fontSize: 13, color: 'var(--wp-ink-soft)' }}>
        <span className="wp-serif-italic">Made with care.</span> Free to use.
      </footer>
    </main>
  )
}
