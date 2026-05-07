import type { YearGroup } from '@/app/kids-academy/types/curriculum'

const YEAR_STYLES: Record<YearGroup, string> = {
  1: 'bg-ka-year1-light text-orange-900',
  2: 'bg-ka-year2-light text-yellow-900',
  3: 'bg-ka-year3-light text-green-900',
  4: 'bg-ka-year4-light text-blue-900',
  5: 'bg-ka-year5-light text-purple-900',
  6: 'bg-ka-year6-light text-red-900',
}

type Props = {
  year: YearGroup
  className?: string
}

export function YearGroupBadge({ year, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${YEAR_STYLES[year]} ${className}`}
    >
      Year {year}
    </span>
  )
}
