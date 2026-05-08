import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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
          <h1 className="font-ka-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] text-slate-900">
            Lessons your child will actually want to do.
          </h1>

          <p className="font-ka-body text-lg text-slate-600 max-w-xl">
            Every topic in the UK National Curriculum gets its own hands-on
            lesson. No videos, no worksheets, no boring quizzes. Just things
            your child can tap, drag, and explore.
          </p>

          <Link
            href="/kids-academy/curriculum"
            className="inline-flex items-center gap-2 h-ka-touch-lg px-6 rounded-full bg-ka-brand-500 text-white font-ka-display font-bold text-base shadow-sm hover:bg-ka-brand-600 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ka-brand-700"
          >
            See the lessons
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>

          <p className="text-xs text-slate-500 max-w-md">
            Free to use. No sign-up, no ads, no tracking. Year 3 lessons are
            ready now. The other year groups are on the way.
          </p>
        </div>
      </section>

      <footer className="px-6 sm:px-10 py-6 text-center text-xs text-slate-400">
        Built by Neil McArdle. Lessons match the statutory UK National Curriculum.
      </footer>
    </main>
  )
}
