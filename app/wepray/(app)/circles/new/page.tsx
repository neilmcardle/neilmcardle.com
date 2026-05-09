'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createCircle } from '../../../lib/queries'

export default function NewCirclePage() {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting || !name.trim()) return
    setSubmitting(true); setError(null)
    try {
      const group = await createCircle(name.trim())
      window.location.href = `/wepray/circles/${group.id}`
    } catch (e: any) {
      setError(e?.message ?? 'Could not create circle')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className="wp-h1">New circle</h1>
        <Link href="/wepray/circles" className="wp-btn wp-btn-ghost">Cancel</Link>
      </header>

      <form onSubmit={onSubmit} className="wp-card" style={{ display: 'grid', gap: 12 }}>
        <label className="wp-label" htmlFor="circle-name">Circle name</label>
        <input
          id="circle-name"
          className="wp-input"
          placeholder="The McArdles · Bible study · Wednesday group"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={60}
          autoFocus
        />
        {error && <div style={{ color: 'var(--wp-clay-deep)', fontSize: 13 }}>{error}</div>}
        <button className="wp-btn" type="submit" disabled={submitting || !name.trim()}>
          {submitting ? '...' : 'Create circle'}
        </button>
        <p className="wp-label" style={{ marginTop: 4 }}>
          You'll get a 6-character invite code to share with friends and family.
        </p>
      </form>
    </div>
  )
}
