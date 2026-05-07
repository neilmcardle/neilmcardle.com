import { Beaker, Calculator, BookOpen, Landmark, Globe2, type LucideIcon } from 'lucide-react'
import type { Subject } from '@/app/kids-academy/types/curriculum'

const SUBJECT_META: Record<Subject, { icon: LucideIcon; label: string; ring: string; tile: string }> = {
  science:   { icon: Beaker,    label: 'Science',   ring: 'ring-ka-science',   tile: 'bg-ka-science-light text-sky-900' },
  maths:     { icon: Calculator, label: 'Maths',    ring: 'ring-ka-maths',     tile: 'bg-ka-maths-light text-amber-900' },
  english:   { icon: BookOpen,  label: 'English',   ring: 'ring-ka-english',   tile: 'bg-ka-english-light text-pink-900' },
  history:   { icon: Landmark,  label: 'History',   ring: 'ring-ka-history',   tile: 'bg-ka-history-light text-violet-900' },
  geography: { icon: Globe2,    label: 'Geography', ring: 'ring-ka-geography', tile: 'bg-ka-geography-light text-emerald-900' },
}

type Props = {
  subject: Subject
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE: Record<NonNullable<Props['size']>, { tile: string; icon: number; text: string }> = {
  sm: { tile: 'w-8 h-8 rounded-lg',  icon: 16, text: 'text-sm' },
  md: { tile: 'w-10 h-10 rounded-xl', icon: 20, text: 'text-base' },
  lg: { tile: 'w-12 h-12 rounded-2xl', icon: 24, text: 'text-lg' },
}

export function SubjectIcon({ subject, showLabel = true, size = 'md', className = '' }: Props) {
  const meta = SUBJECT_META[subject]
  const sz = SIZE[size]
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className={`inline-flex items-center justify-center ${sz.tile} ${meta.tile}`} aria-hidden="true">
        <Icon size={sz.icon} strokeWidth={2.25} />
      </span>
      {showLabel && (
        <span className={`font-ka-display font-semibold ${sz.text}`}>{meta.label}</span>
      )}
    </span>
  )
}
