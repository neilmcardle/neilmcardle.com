import type {
  CurriculumTopic,
  Subject,
  YearGroup,
  YearCurriculum,
} from '@/app/kids-academy/types/curriculum'

import year1 from '@/app/kids-academy/content/curriculum/year-1.json'
import year2 from '@/app/kids-academy/content/curriculum/year-2.json'
import year3 from '@/app/kids-academy/content/curriculum/year-3.json'
import year4 from '@/app/kids-academy/content/curriculum/year-4.json'
import year5 from '@/app/kids-academy/content/curriculum/year-5.json'
import year6 from '@/app/kids-academy/content/curriculum/year-6.json'

const ALL_YEARS: YearCurriculum[] = [
  year1 as YearCurriculum,
  year2 as YearCurriculum,
  year3 as YearCurriculum,
  year4 as YearCurriculum,
  year5 as YearCurriculum,
  year6 as YearCurriculum,
]

export function listAll(): YearCurriculum[] {
  return ALL_YEARS
}

export function listByYear(year: YearGroup): CurriculumTopic[] {
  return ALL_YEARS.find((y) => y.yearGroup === year)?.topics ?? []
}

export function listBySubject(year: YearGroup, subject: Subject): CurriculumTopic[] {
  return listByYear(year).filter((t) => t.subject === subject)
}

export function getTopic(
  year: YearGroup,
  subject: Subject,
  topic: string,
): CurriculumTopic | undefined {
  return listByYear(year).find((t) => t.subject === subject && t.topic === topic)
}

export function parseYearParam(raw: string | undefined): YearGroup | undefined {
  if (!raw) return undefined
  const match = raw.match(/^year-([1-6])$/)
  if (!match) return undefined
  return Number(match[1]) as YearGroup
}

export function isSubject(value: string | undefined): value is Subject {
  return (
    value === 'science' ||
    value === 'maths' ||
    value === 'english' ||
    value === 'history' ||
    value === 'geography'
  )
}
