'use client'

import Link from 'next/link'
import { Clock, Lock } from 'lucide-react'
import type { CurriculumTopic } from '@/app/kids-academy/types/curriculum'
import type { ToolProgress } from '@/app/kids-academy/lib/progress'
import { SubjectIcon } from './subject-icon'
import { ProgressRing } from '../progress/progress-ring'

type Props = {
  topic: CurriculumTopic
  progress?: ToolProgress
}

export function ToolCard({ topic, progress }: Props) {
  const isPlanned = topic.status === 'planned'
  const href = `/kids-academy/learn/year-${topic.yearGroup}/${topic.subject}/${topic.topic}`
  const status = progress?.status ?? 'not_started'

  const card = (
    <div
      className={`group relative flex flex-col gap-4 p-5 rounded-2xl border bg-white transition
        ${isPlanned
          ? 'border-slate-100 opacity-70 cursor-not-allowed'
          : 'border-slate-200 hover:border-ka-brand-500 hover:shadow-md'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <SubjectIcon subject={topic.subject} showLabel={false} size="lg" />
        {isPlanned ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-2xs font-semibold uppercase tracking-wide">
            <Lock size={10} /> Coming soon
          </span>
        ) : status === 'completed' ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-ka-year3-light text-green-900 text-2xs font-semibold uppercase tracking-wide">
            Complete
          </span>
        ) : status === 'in_progress' && progress ? (
          <ProgressRing percentage={progress.percentage} size={36} strokeWidth={4} />
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-ka-display text-lg font-bold text-slate-900 leading-tight">
          {topic.title}
        </h3>
        <p className="font-ka-body text-sm text-slate-600 line-clamp-2">
          {topic.ncObjectives[0]}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Clock size={14} />
        <span>{topic.estimatedMinutes} min</span>
      </div>
    </div>
  )

  if (isPlanned) {
    return <div aria-disabled="true">{card}</div>
  }

  return (
    <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ka-brand-500 rounded-2xl">
      {card}
    </Link>
  )
}
