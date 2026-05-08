import { notFound } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'
import { getTopic, isSubject, parseYearParam } from '@/app/kids-academy/lib/curriculum'
import { DEFAULT_CHILD_PROFILE } from '@/app/kids-academy/types/curriculum'
import { ToolRunner } from '@/app/kids-academy/components/layout/tool-runner'
import { StuckButton } from '@/app/kids-academy/components/ui/stuck-button'
import { MuteToggle } from '@/app/kids-academy/components/ui/mute-toggle'

type Params = { year: string; subject: string; topic: string }

export default async function LearnPage({ params }: { params: Promise<Params> }) {
  const { year: yearParam, subject: subjectParam, topic: topicSlug } = await params

  const year = parseYearParam(yearParam)
  if (!year) notFound()
  if (!isSubject(subjectParam)) notFound()

  const topic = getTopic(year, subjectParam, topicSlug)
  if (!topic) notFound()

  return (
    <>
      <header className="shrink-0 bg-white border-b border-slate-200">
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 h-14 grid grid-cols-3 items-center gap-3">
          <div className="justify-self-start">
            <Link
              href="/kids-academy/curriculum"
              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition focus-visible:outline-2 focus-visible:outline-ka-brand-500"
              aria-label="Exit"
            >
              <X size={20} strokeWidth={2.25} />
            </Link>
          </div>
          <h1 className="justify-self-center font-ka-display text-sm sm:text-base font-bold tracking-tight text-slate-800 truncate text-center">
            {topic.title}
          </h1>
          <div className="justify-self-end inline-flex items-center gap-2">
            <MuteToggle />
            <StuckButton />
          </div>
        </div>
      </header>

      <ToolRunner topic={topic} childProfile={DEFAULT_CHILD_PROFILE} />
    </>
  )
}
