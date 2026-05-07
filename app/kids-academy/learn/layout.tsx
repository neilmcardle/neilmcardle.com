import Link from 'next/link'
import { X } from 'lucide-react'
import { StuckButton } from '@/app/kids-academy/components/ui/stuck-button'

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col bg-slate-50 overflow-hidden">
      <header className="shrink-0 bg-white border-b border-slate-200">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href="/kids-academy/curriculum"
            className="inline-flex items-center gap-2 px-3 h-9 rounded-full text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Exit to curriculum map"
          >
            <X size={16} />
            <span className="hidden sm:inline">Exit</span>
          </Link>
          <span className="font-ka-display text-sm font-bold tracking-tight text-slate-700">
            Kids Academy
          </span>
          <StuckButton />
        </div>
      </header>

      <main className="flex-1 min-h-0 flex flex-col">{children}</main>
    </div>
  )
}
