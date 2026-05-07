'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

type Props = {
  show: boolean
  message?: string
  onDismiss?: () => void
}

const PARTICLE_COLORS = ['#F59E0B', '#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#EF4444']

export function CelebrationAnimation({ show, message = 'Nice work!', onDismiss }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          role="dialog"
          aria-live="polite"
        >
          <motion.div
            className="relative flex flex-col items-center gap-4 px-8 py-10 rounded-3xl bg-white shadow-xl"
            initial={{ scale: 0.7, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (i / 14) * Math.PI * 2
              const distance = 110 + Math.random() * 40
              const x = Math.cos(angle) * distance
              const y = Math.sin(angle) * distance
              return (
                <motion.span
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PARTICLE_COLORS[i % PARTICLE_COLORS.length] }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{ x, y, opacity: [0, 1, 0], scale: [0, 1, 0.6] }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.02 }}
                />
              )
            })}
            <Sparkles className="text-ka-year2" size={48} strokeWidth={2.5} aria-hidden="true" />
            <p className="font-ka-display text-2xl font-bold text-slate-900">{message}</p>
            <p className="font-ka-body text-sm text-slate-600">Tap anywhere to keep exploring.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
