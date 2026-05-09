'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { Group, PrayerView } from '@/lib/wepray/types'
import { getCircle, getMemberCount, listPrayersForGroup } from '../../../lib/queries'
import { PrayerCard } from '../../../components/PrayerCard'
import { CreatePrayerForm } from '../../../components/CreatePrayerForm'

export default function CircleDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [circle, setCircle] = useState<Group | null | undefined>(undefined)
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [prayers, setPrayers] = useState<PrayerView[] | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function load() {
    if (!id) return
    try {
      const [c, m, p] = await Promise.all([
        getCircle(id),
        getMemberCount(id),
        listPrayersForGroup(id),
      ])
      setCircle(c); setMemberCount(m); setPrayers(p)
    } catch (e: any) {
      setError(e?.message ?? 'Could not load circle')
    }
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id])

  async function shareInvite() {
    if (!circle) return
    const url = `${window.location.origin}/wepray/join?code=${circle.invite_code}`
    const text = `Join my prayer circle "${circle.name}" on WePray. Invite code: ${circle.invite_code}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'WePray', text, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true); setTimeout(() => setCopied(false), 1800)
      }
    } catch {/* user cancelled */}
  }

  if (circle === undefined && !error) {
    return <div className="wp-eyebrow">Loading</div>
  }

  if (circle === null) {
    return (
      <div className="wp-card" style={{ display: 'grid', gap: 8 }}>
        <h2 className="wp-h2">Circle not found</h2>
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
          You may not have access. Try the invite link again.
        </p>
        <Link href="/wepray/circles" className="wp-btn wp-btn-secondary">Back to circles</Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ display: 'grid', gap: 6 }}>
        <Link href="/wepray/circles" className="wp-link" style={{ fontSize: 13, width: 'fit-content' }}>← Circles</Link>
        <h1 className="wp-h1" style={{ marginTop: 4 }}>{circle?.name}</h1>
        <div className="wp-label">
          {memberCount ?? '–'} {memberCount === 1 ? 'member' : 'members'} · code <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.06em' }}>{circle?.invite_code}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          <button onClick={shareInvite} className="wp-btn wp-btn-secondary">
            {copied ? 'Copied!' : 'Share invite'}
          </button>
          <button onClick={() => setShowCompose(s => !s)} className="wp-btn">
            {showCompose ? 'Close' : 'New prayer'}
          </button>
        </div>
      </header>

      {error && <div className="wp-card" style={{ borderColor: 'var(--wp-clay)', color: 'var(--wp-clay-deep)' }}>{error}</div>}

      {showCompose && id && (
        <CreatePrayerForm groupId={id} onCreated={() => { setShowCompose(false); load() }} />
      )}

      {prayers && prayers.length === 0 && !showCompose && (
        <div className="wp-card wp-card-paper">
          <h2 className="wp-h2" style={{ marginBottom: 6 }}>No prayers yet</h2>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>Be the first to share what's on your heart.</p>
        </div>
      )}

      {prayers && prayers.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {prayers.map(p => (
            <li key={p.id}><PrayerCard prayer={p} onChange={load} /></li>
          ))}
        </ul>
      )}
    </div>
  )
}
