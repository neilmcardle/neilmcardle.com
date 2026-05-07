'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ENCOURAGEMENTS = [
  "Try giving it another go — you're closer than you think.",
  "Take a breath. What did you try last? Try the opposite.",
  "Sometimes the answer is hiding in the picture. Look closely.",
  "It's OK to be stuck. Read the question again, slowly.",
  "You don't have to get it right the first time. Keep exploring.",
]

export function StuckButton() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(ENCOURAGEMENTS[0])

  function toggle() {
    if (!open) {
      setMessage(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)])
    }
    setOpen((v) => !v)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 h-ka-touch px-4 rounded-full bg-ka-brand-500 text-white font-ka-display font-semibold text-sm shadow-sm hover:bg-ka-brand-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ka-brand-700"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <HelpCircle size={18} strokeWidth={2.5} />
        I'm stuck
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-72 p-4 rounded-2xl bg-white border border-slate-200 shadow-lg z-30"
          >
            <p className="font-ka-body text-sm text-slate-800">{message}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 text-xs font-semibold text-ka-brand-600 hover:text-ka-brand-700"
            >
              Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
