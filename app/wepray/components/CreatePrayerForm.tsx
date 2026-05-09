'use client'

import { useState } from 'react'
import type { PrayerTag } from '@/lib/wepray/types'
import { createPrayer } from '../lib/queries'
import { useWeprayAuth } from '../hooks/useWeprayAuth'

const TAGS: { value: PrayerTag; label: string }[] = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'praise', label: 'Praise' },
]

export function CreatePrayerForm({ groupId, onCreated }: { groupId: string; onCreated: () => void }) {
  const { user } = useWeprayAuth()
  const [body, setBody] = useState('')
  const [tag, setTag] = useState<PrayerTag>('ongoing')
  const [verseRef, setVerseRef] = useState('')
  const [verseText, setVerseText] = useState('')
  const [showVerse, setShowVerse] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting || !body.trim() || !user) return
    setSubmitting(true); setError(null)
    try {
      await createPrayer({
        groupId, authorId: user.id,
        body: body.trim(), tag,
        verseRef: showVerse && verseRef.trim() ? verseRef.trim() : null,
        verseText: showVerse && verseText.trim() ? verseText.trim() : null,
      })
      setBody(''); setVerseRef(''); setVerseText(''); setShowVerse(false); setTag('ongoing')
      onCreated()
    } catch (e: any) {
      setError(e?.message ?? 'Could not post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="wp-card" style={{ display: 'grid', gap: 10 }}>
      <textarea
        className="wp-textarea"
        placeholder="What needs prayer?"
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={4}
      />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TAGS.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTag(t.value)}
            className={`wp-tag ${tag === t.value ? `wp-tag-${t.value}` : ''}`}
            style={{ cursor: 'pointer', padding: '0.375rem 0.625rem' }}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowVerse(s => !s)}
          className="wp-btn wp-btn-ghost"
          style={{ padding: '0.375rem 0.625rem', fontSize: '0.625rem', marginLeft: 'auto' }}
        >
          {showVerse ? 'Remove verse' : '+ Verse'}
        </button>
      </div>

      {showVerse && (
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            className="wp-input"
            placeholder="Reference (e.g. Psalm 23:1)"
            value={verseRef}
            onChange={e => setVerseRef(e.target.value)}
          />
          <textarea
            className="wp-textarea"
            placeholder="Verse text (optional)"
            value={verseText}
            onChange={e => setVerseText(e.target.value)}
            rows={2}
          />
        </div>
      )}

      {error && <div style={{ color: 'var(--wp-clay-deep)', fontSize: 13 }}>{error}</div>}
      <button className="wp-btn" type="submit" disabled={submitting || !body.trim()}>
        {submitting ? '...' : 'Post prayer'}
      </button>
    </form>
  )
}
