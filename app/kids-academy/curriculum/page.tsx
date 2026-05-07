'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { listAll } from '@/app/kids-academy/lib/curriculum'
import { getAllProgress, type ProgressMap } from '@/app/kids-academy/lib/progress'
import { ToolCard } from '@/app/kids-academy/components/ui/tool-card'
import { YearGroupBadge } from '@/app/kids-academy/components/ui/year-group-badge'

export default function CurriculumMap() {
  const years = listAll()
  const [progress, setProgress] = useState<ProgressMap>({})

  useEffect(() => {
    setProgress(getAllProgress())
  }, [])

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 py-6 flex items-center justify-between gap-4">
        <Link
          href="/kids-academy"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} /> Home
        </Link>
        <span className="font-ka-display text-base font-bold tracking-tight">
          Kids Academy
        </span>
      </header>

      <section className="px-6 sm:px-10 pb-16 max-w-6xl w-full mx-auto">
        <div className="mb-10 flex flex-col gap-2">
          <h1 className="font-ka-display text-3xl sm:text-4xl font-extrabold text-slate-900">
            Curriculum
          </h1>
          <p className="font-ka-body text-base text-slate-600 max-w-2xl">
            Every topic from the UK National Curriculum, Years 1 through 6.
            Topics marked "coming soon" are scheduled — Year 3 is the pilot.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {years.map((year) => (
            <section key={year.yearGroup}>
              <div className="flex items-center gap-3 mb-5">
                <YearGroupBadge year={year.yearGroup} />
                <h2 className="font-ka-display text-xl font-bold text-slate-800">
                  {year.topics.length === 0 ? 'Topics coming soon' : `${year.topics.length} topic${year.topics.length === 1 ? '' : 's'}`}
                </h2>
              </div>

              {year.topics.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="font-ka-body text-sm text-slate-500">
                    Year {year.yearGroup} content is being built. Year 3 is the
                    pilot — once it lands, the other year groups follow.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {year.topics.map((topic) => (
                    <ToolCard
                      key={topic.id}
                      topic={topic}
                      progress={progress[topic.id]}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </section>
    </main>
  )
}
