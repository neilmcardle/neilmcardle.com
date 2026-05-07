'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type {
  CurriculumTopic,
  ChildProfile,
  ToolResult,
} from '@/app/kids-academy/types/curriculum'
import { setProgress } from '@/app/kids-academy/lib/progress'
import { CelebrationAnimation } from '@/app/kids-academy/components/progress/celebration-animation'
import { getTool } from '@/app/kids-academy/components/interactive/registry'

type Props = {
  topic: CurriculumTopic
  childProfile: ChildProfile
}

export function ToolRunner({ topic, childProfile }: Props) {
  const [showCelebration, setShowCelebration] = useState(false)
  const startedAt = useRef<number>(Date.now())

  const Tool = getTool(topic.id)

  useEffect(() => {
    setProgress(topic.id, { status: 'in_progress' })
    startedAt.current = Date.now()
  }, [topic.id])

  function handleProgress(p: number) {
    const next = Math.min(100, Math.max(0, Math.round(p)))
    setProgress(topic.id, { percentage: next, status: next >= 100 ? 'completed' : 'in_progress' })
  }

  function handleComplete(result: ToolResult) {
    setProgress(topic.id, {
      status: 'completed',
      percentage: 100,
      timeSpentSeconds: result.durationSeconds || Math.round((Date.now() - startedAt.current) / 1000),
    })
    setShowCelebration(true)
  }

  if (!Tool) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md text-center flex flex-col gap-4">
          <h2 className="font-ka-display text-2xl font-bold text-slate-900">
            This topic is being built.
          </h2>
          <p className="font-ka-body text-sm text-slate-600">
            {topic.title} is in the curriculum, but its interactive tool hasn't
            shipped yet. Check back soon.
          </p>
          <Link
            href="/kids-academy/curriculum"
            className="inline-flex items-center justify-center gap-2 h-ka-touch px-5 mx-auto rounded-full bg-ka-brand-500 text-white font-ka-display font-semibold text-sm hover:bg-ka-brand-600 transition"
          >
            Back to curriculum
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 min-h-0 flex flex-col">
        <Tool
          childProfile={childProfile}
          onProgress={handleProgress}
          onComplete={handleComplete}
        />
      </div>

      <CelebrationAnimation
        show={showCelebration}
        message={`${topic.title} complete!`}
        onDismiss={() => setShowCelebration(false)}
      />
    </>
  )
}
