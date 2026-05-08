'use client'

import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  stepIndex: number
  done: boolean
  onBack: () => void
  onForward?: () => void
  onResetStep: () => void
  isFirst?: boolean
  canGoForward?: boolean
}

// Shared footer for every lesson step. Replaces the old Continue button:
// auto-advance does the forward move on first completion, but Back + Forward
// let the user navigate between completed sections without scrolling. Start
// over resets just this step's state. The "Got it!" badge appears once the
// step is complete.
export function LessonStepFooter({
  stepIndex,
  done,
  onBack,
  onForward,
  onResetStep,
  isFirst,
  canGoForward,
}: Props) {
  const backDisabled = isFirst ?? stepIndex === 0
  const forwardDisabled = !canGoForward
  return (
    <div className="shrink-0 pt-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-ka-brand-500"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          type="button"
          onClick={onForward}
          disabled={forwardDisabled}
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-ka-brand-500"
        >
          Forward <ArrowRight size={14} />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <AnimatePresence>
          {done && (
            <motion.span
              key="passed"
              initial={{ opacity: 0, x: 8, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="inline-flex items-center gap-1.5 font-ka-body text-xs font-semibold text-green-700"
            >
              <Check size={14} strokeWidth={3} className="text-ka-year3" />
              Got it!
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={onResetStep}
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition focus-visible:outline-2 focus-visible:outline-ka-brand-500"
        >
          <RotateCcw size={12} /> Start over
        </button>
      </div>
    </div>
  )
}
