'use client'

import { useEffect, useRef } from 'react'
import { play } from '@/app/kids-academy/lib/sound'

// Hook that auto-advances to the next step ~2s after the current step is
// completed. Tracks which step indices we've already auto-advanced from so
// going back to a completed step doesn't fire a second auto-advance.
//
// The returned ref is exposed so callers can clear it on a per-step
// "Start over" or a full Restart.
export function useAutoAdvance({
  activeStep,
  justCompleted,
  unlockedUpTo,
  setUnlockedUpTo,
  totalSteps,
  scrollToStep,
  moduleCompletePlayed,
  delayMs = 2000,
}: {
  activeStep: number
  justCompleted: number | null
  unlockedUpTo: number
  setUnlockedUpTo: (n: number) => void
  totalSteps: number
  scrollToStep: (n: number) => void
  moduleCompletePlayed: React.MutableRefObject<boolean>
  delayMs?: number
}) {
  const autoAdvancedRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (justCompleted === null) return
    if (autoAdvancedRef.current.has(justCompleted)) return
    if (justCompleted !== activeStep) return
    const t = setTimeout(() => {
      autoAdvancedRef.current.add(justCompleted)
      const next = justCompleted + 1
      if (next > unlockedUpTo) setUnlockedUpTo(next)
      if (next === totalSteps && !moduleCompletePlayed.current) {
        moduleCompletePlayed.current = true
        play('moduleComplete')
      }
      requestAnimationFrame(() => scrollToStep(next))
    }, delayMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justCompleted, activeStep, unlockedUpTo, totalSteps])

  return autoAdvancedRef
}
