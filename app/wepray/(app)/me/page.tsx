'use client'

import { useWeprayAuth } from '../../hooks/useWeprayAuth'

export default function MePage() {
  const { user, signOut } = useWeprayAuth()

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header>
        <h1 className="wp-h1">Me</h1>
      </header>

      <div className="wp-card" style={{ display: 'grid', gap: 6 }}>
        <div className="wp-label">Signed in as</div>
        <div style={{ fontSize: 16, fontWeight: 600, wordBreak: 'break-all' }}>{user?.email ?? '—'}</div>
      </div>

      <div className="wp-card wp-card-paper">
        <h2 className="wp-h2" style={{ marginBottom: 6 }}>About WePray</h2>
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
          A small, private place to pray with the people closest to you. Made with care.
        </p>
      </div>

      <button onClick={signOut} className="wp-btn wp-btn-secondary">Sign out</button>
    </div>
  )
}
