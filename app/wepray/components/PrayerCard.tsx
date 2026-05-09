'use client'

import { useState } from 'react'
import type { PrayerView } from '@/lib/wepray/types'
import { recordPrayedEvent, togglePrayerAnswered } from '../lib/queries'
import { useWeprayAuth } from '../hooks/useWeprayAuth'

const tagClass: Record<PrayerView['tag'], string> = {
  praise: 'wp-tag wp-tag-praise',
  urgent: 'wp-tag wp-tag-urgent',
  ongoing: 'wp-tag wp-tag-ongoing',
}

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

export function PrayerCard({ prayer, onChange }: { prayer: PrayerView; onChange?: () => void }) {
  const { user } = useWeprayAuth()
  const [busy, setBusy] = useState(false)
  const [optimistic, setOptimistic] = useState({
    iPrayed: prayer.i_prayed,
    count: prayer.prayer_count,
    answered: prayer.answered,
  })
  const isAuthor = user?.id === prayer.author_id

  async function onIPrayed() {
    if (busy || optimistic.iPrayed || !user) return
    setBusy(true)
    setOptimistic(s => ({ ...s, iPrayed: true, count: s.count + 1 }))
    try {
      await recordPrayedEvent({ prayerId: prayer.id, userId: user.id })
      onChange?.()
    } catch (err) {
      setOptimistic(s => ({ ...s, iPrayed: false, count: Math.max(0, s.count - 1) }))
      console.error(err)
    } finally {
      setBusy(false)
    }
  }

  async function onToggleAnswered() {
    if (busy || !isAuthor) return
    const next = !optimistic.answered
    setBusy(true)
    setOptimistic(s => ({ ...s, answered: next }))
    try {
      await togglePrayerAnswered(prayer.id, next)
      onChange?.()
    } catch (err) {
      setOptimistic(s => ({ ...s, answered: !next }))
      console.error(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className={`wp-card ${optimistic.answered ? 'wp-card-paper' : ''}`} style={{ display: 'grid', gap: 10 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span className={tagClass[prayer.tag]}>{prayer.tag}</span>
          {optimistic.answered && <span className="wp-tag wp-tag-praise">Answered</span>}
          <span className="wp-label" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {prayer.author_name ?? 'A friend'} · {timeAgo(prayer.created_at)}
          </span>
        </div>
      </header>

      <p style={{ fontSize: 16, lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>{prayer.body}</p>

      {prayer.verse_ref && (
        <blockquote className="wp-card wp-card-paper" style={{ margin: 0, padding: '0.625rem 0.75rem' }}>
          {prayer.verse_text && (
            <p style={{ fontStyle: 'italic', fontSize: 14, lineHeight: 1.5, margin: '0 0 4px' }}>
              "{prayer.verse_text}"
            </p>
          )}
          <div className="wp-label">— {prayer.verse_ref}</div>
        </blockquote>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={onIPrayed}
          disabled={busy || optimistic.iPrayed}
          className={`wp-btn ${optimistic.iPrayed ? 'wp-btn-secondary' : ''}`}
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.625rem' }}
        >
          {optimistic.iPrayed ? 'Prayed' : 'I prayed'}
        </button>
        <span className="wp-label">{optimistic.count} {optimistic.count === 1 ? 'prayer' : 'prayers'}</span>
        {isAuthor && (
          <button
            onClick={onToggleAnswered}
            disabled={busy}
            className="wp-btn wp-btn-ghost"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.625rem', marginLeft: 'auto' }}
          >
            {optimistic.answered ? 'Mark unanswered' : 'Mark answered'}
          </button>
        )}
      </div>
    </article>
  )
}
