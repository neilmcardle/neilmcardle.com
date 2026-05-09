'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useWeprayAuth } from '../hooks/useWeprayAuth'
import { joinCircleByCode } from '../lib/queries'
import { AuthForm } from '../components/AuthForm'

function JoinInner() {
  const sp = useSearchParams()
  const code = (sp?.get('code') ?? '').toUpperCase()
  const { user, loading } = useWeprayAuth()
  const [status, setStatus] = useState<'idle' | 'joining' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!code) return
    if (!user) return
    if (status !== 'idle') return
    ;(async () => {
      setStatus('joining')
      try {
        const group = await joinCircleByCode(code)
        window.location.replace(`/wepray/circles/${group.id}`)
      } catch (e: any) {
        setError(e?.message ?? 'Could not join')
        setStatus('error')
      }
    })()
  }, [loading, user, code, status])

  if (!code) {
    return (
      <div className="wp-card">
        <h1 className="wp-h2">No invite code</h1>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
          This link is missing an invite code. Ask the person who invited you to share it again.
        </p>
      </div>
    )
  }

  if (loading) {
    return <div className="wp-eyebrow">Loading</div>
  }

  if (!user) {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <header>
          <h1 className="wp-h1">You're invited</h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, marginTop: 8 }}>
            Sign in or create an account to join the circle. Your invite code <strong>{code}</strong> will be applied automatically.
          </p>
        </header>
        <AuthForm />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="wp-card" style={{ borderColor: 'var(--wp-clay)' }}>
        <h2 className="wp-h2">Couldn't join</h2>
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: '8px 0 0' }}>{error}</p>
      </div>
    )
  }

  return <div className="wp-eyebrow">Joining {code}</div>
}

export default function JoinPage() {
  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '2.5rem 1.5rem 3rem' }}>
      <Suspense fallback={<div className="wp-eyebrow">Loading</div>}>
        <JoinInner />
      </Suspense>
    </main>
  )
}
