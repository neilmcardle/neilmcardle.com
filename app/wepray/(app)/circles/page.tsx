'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Group } from '@/lib/wepray/types'
import { listMyCircles, joinCircleByCode } from '../../lib/queries'

export default function CirclesPage() {
  const [circles, setCircles] = useState<Group[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)

  async function load() {
    try { setCircles(await listMyCircles()) }
    catch (e: any) { setError(e?.message ?? 'Could not load') }
  }
  useEffect(() => { load() }, [])

  async function onJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!joinCode.trim() || joining) return
    setJoining(true); setError(null)
    try {
      const group = await joinCircleByCode(joinCode.trim().toUpperCase())
      window.location.href = `/wepray/circles/${group.id}`
    } catch (e: any) {
      setError(e?.message ?? 'Could not join')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <h1 className="wp-h1">Circles</h1>
        <Link href="/wepray/circles/new" className="wp-btn">New</Link>
      </header>

      {error && <div className="wp-card" style={{ borderColor: 'var(--wp-clay)', color: 'var(--wp-clay-deep)' }}>{error}</div>}

      {circles === null && (
        <div className="wp-eyebrow">Loading</div>
      )}

      {circles && circles.length === 0 && (
        <div className="wp-card wp-card-paper">
          <h2 className="wp-h2" style={{ marginBottom: 8 }}>You're not in a circle yet</h2>
          <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0 }}>Create one, or paste an invite code below.</p>
        </div>
      )}

      {circles && circles.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {circles.map(c => (
            <li key={c.id}>
              <Link
                href={`/wepray/circles/${c.id}`}
                className="wp-card"
                style={{ display: 'grid', gap: 6, textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span className="wp-h2" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span className="wp-tag">{c.invite_code}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onJoin} className="wp-card wp-card-paper" style={{ display: 'grid', gap: 10 }}>
        <h2 className="wp-h2">Join with a code</h2>
        <input
          className="wp-input"
          placeholder="ABC123"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          maxLength={6}
          autoComplete="off"
          inputMode="text"
          spellCheck={false}
        />
        <button className="wp-btn" type="submit" disabled={joining || joinCode.trim().length < 6}>
          {joining ? '...' : 'Join'}
        </button>
      </form>
    </div>
  )
}
