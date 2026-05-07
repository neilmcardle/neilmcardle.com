import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function KidsAcademyHome() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 py-6 flex items-center justify-between">
        <Link href="/kids-academy" className="font-ka-display text-lg font-bold tracking-tight">
          Kids Academy
        </Link>
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-slate-900 transition"
        >
          neilmcardle.com
        </Link>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 pb-16">
        <div className="max-w-2xl flex flex-col items-center text-center gap-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ka-brand-50 text-ka-brand-700 text-xs font-semibold uppercase tracking-wide">
            <Sparkles size={14} /> Soft-launch · building in the open
          </span>

          <h1 className="font-ka-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] text-slate-900">
            Interactive learning, made for the UK National Curriculum.
          </h1>

          <p className="font-ka-body text-lg text-slate-600 max-w-xl">
            Every topic, from Year 1 through Year 6, gets its own purpose-built
            interactive tool. Not videos, not worksheets, not multiple choice —
            things you can actually <em>do</em>.
          </p>

          <Link
            href="/kids-academy/curriculum"
            className="inline-flex items-center gap-2 h-ka-touch-lg px-6 rounded-full bg-ka-brand-500 text-white font-ka-display font-bold text-base shadow-sm hover:bg-ka-brand-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ka-brand-700"
          >
            Explore the curriculum
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>

          <p className="text-xs text-slate-500 max-w-md">
            Free to use. No accounts, no signup. Progress saves to your device.
          </p>
        </div>
      </section>

      <footer className="px-6 sm:px-10 py-6 text-center text-xs text-slate-400">
        Built by Neil McArdle. Mapped to the statutory DfE National Curriculum.
      </footer>
    </main>
  )
}
