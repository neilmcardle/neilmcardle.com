'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listMyCircles, listRecentPrayersAcrossCircles } from '../../lib/queries'
import { PrayerCard } from '../../components/PrayerCard'
import { useWeprayAuth } from '../../hooks/useWeprayAuth'
import type { Group, PrayerView } from '@/lib/wepray/types'

export default function WeprayHomePage() {
  const { user } = useWeprayAuth()
  const [circles, setCircles] = useState<Group[] | null>(null)
  const [prayers, setPrayers] = useState<PrayerView[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      const [c, p] = await Promise.all([listMyCircles(), listRecentPrayersAcrossCircles(20)])
      setCircles(c); setPrayers(p)
    } catch (e: any) {
      setError(e?.message ?? 'Could not load')
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ marginBottom: 4 }}>
        <div className="wp-label">Welcome back</div>
        <h1 className="wp-h1" style={{ marginTop: 4 }}>{user?.email?.split('@')[0] ?? 'Friend'}</h1>
      </header>

      {error && <div className="wp-card" style={{ borderColor: 'var(--wp-clay)', color: 'var(--wp-clay-deep)' }}>{error}</div>}

      {circles && circles.length === 0 && (
        <div className="wp-card wp-card-paper" style={{ display: 'grid', gap: 10 }}>
          <h2 className="wp-h2">Start a circle</h2>
          <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0 }}>
            Create a private circle for your family or friends, then share the invite code.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/wepray/circles/new" className="wp-btn">Create circle</Link>
            <Link href="/wepray/circles" className="wp-btn wp-btn-secondary">Join with a code</Link>
          </div>
        </div>
      )}

      {circles && circles.length > 0 && prayers && prayers.length === 0 && (
        <div className="wp-card wp-card-paper" style={{ display: 'grid', gap: 10 }}>
          <h2 className="wp-h2">No prayers yet</h2>
          <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0 }}>
            Open a circle and share the first prayer.
          </p>
          <Link href="/wepray/circles" className="wp-btn">Open a circle</Link>
        </div>
      )}

      {prayers && prayers.length > 0 && (
        <section style={{ display: 'grid', gap: 12 }}>
          <h2 className="wp-h2">Recent prayers</h2>
          {prayers.map(p => <PrayerCard key={p.id} prayer={p} onChange={load} />)}
        </section>
      )}

      {circles === null && prayers === null && !error && (
        <div className="wp-eyebrow">Loading</div>
      )}
    </div>
  )
}
