import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getTopic, isSubject, parseYearParam } from '@/app/kids-academy/lib/curriculum'
import { DEFAULT_CHILD_PROFILE } from '@/app/kids-academy/types/curriculum'
import { ToolRunner } from '@/app/kids-academy/components/layout/tool-runner'
import { SubjectIcon } from '@/app/kids-academy/components/ui/subject-icon'
import { YearGroupBadge } from '@/app/kids-academy/components/ui/year-group-badge'

type Params = { year: string; subject: string; topic: string }

export default async function LearnPage({ params }: { params: Promise<Params> }) {
  const { year: yearParam, subject: subjectParam, topic: topicSlug } = await params

  const year = parseYearParam(yearParam)
  if (!year) notFound()
  if (!isSubject(subjectParam)) notFound()

  const topic = getTopic(year, subjectParam, topicSlug)
  if (!topic) notFound()

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 sm:px-6 py-2 max-w-6xl w-full mx-auto flex flex-wrap items-center gap-2 text-sm text-slate-500 shrink-0">
        <YearGroupBadge year={topic.yearGroup} />
        <ChevronRight size={14} className="opacity-50" />
        <Link
          href="/kids-academy/curriculum"
          className="inline-flex items-center hover:text-slate-900 transition"
        >
          <SubjectIcon subject={topic.subject} showLabel size="sm" />
        </Link>
        <ChevronRight size={14} className="opacity-50" />
        <span className="font-ka-display font-semibold text-slate-800 text-base">
          {topic.title}
        </span>
      </div>

      <ToolRunner topic={topic} childProfile={DEFAULT_CHILD_PROFILE} />
    </div>
  )
}
