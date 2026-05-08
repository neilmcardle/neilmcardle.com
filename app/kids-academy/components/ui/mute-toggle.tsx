'use client'

import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { isMuted, setMuted } from '@/app/kids-academy/lib/sound'

export function MuteToggle() {
  const [muted, setMutedState] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setMutedState(isMuted())
    setHydrated(true)
  }, [])

  function toggle() {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition focus-visible:outline-2 focus-visible:outline-ka-brand-500"
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      aria-pressed={muted}
    >
      {hydrated && muted ? (
        <VolumeX size={18} strokeWidth={2.25} />
      ) : (
        <Volume2 size={18} strokeWidth={2.25} />
      )}
    </button>
  )
}
