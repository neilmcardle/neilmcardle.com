import type { Metadata } from "next";
import Link from "next/link";
import { SparkMark } from "@/components/spark/SparkMark";
import { SparkWaitlistForm } from "./SparkWaitlistForm";

export const metadata: Metadata = {
  title: "Spark — Become an engineer",
  description:
    "A learning platform built from a spark, to teach designers full-stack engineering. A course built for designers, by a designer, so they can build for themselves.",
};

export default function SparkPage() {
  return (
    <div className="min-h-screen bg-[var(--spark-ink)] text-white">
      <header className="flex h-[76px] items-center border-b border-white/[0.07] px-5 lg:h-[92px] lg:px-14">
        <Link
          href="/"
          aria-label="Neil McArdle"
          className="text-cream transition-opacity hover:opacity-70"
        >
          <svg
            width="24"
            height="24"
            viewBox="18 18 27 27"
            fill="currentColor"
            aria-hidden
          >
            <path d="M45 45L32 31.2985V18H45V45Z" />
            <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
          </svg>
        </Link>
      </header>

      <div className="px-5 pb-20 pt-12 lg:px-14 lg:pt-14">
        <p className="mb-6 text-[11px] font-medium leading-[1.4] tracking-[0.04em] text-[var(--spark-gold)]">
          + Free while it is being built
        </p>

        <div className="mb-7 flex items-center gap-3">
          <SparkMark className="h-[34px] w-auto shrink-0 text-[var(--spark-gold)]" />
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-normal leading-[1.05] tracking-[-0.02em] text-cream">
            Spark
          </h1>
        </div>

        <p className="mb-10 max-w-[560px] font-serif text-[clamp(1.25rem,3vw,1.75rem)] italic leading-[1.4] text-[var(--spark-on-dark)]">
          A course built for designers, by a designer, so they can build for
          themselves.
        </p>

        <p className="mb-14 max-w-[520px] text-[15px] leading-[1.7] text-[var(--spark-on-dark-muted)]">
          Nineteen modules are readable today. They are still being written and
          edited in public, so expect rough edges and expect them to change.
        </p>

        <div className="max-w-[560px]">
          <Link
            href="/spark/lessons"
            className="spark-card group relative inline-flex min-h-[52px] items-center gap-2.5 overflow-hidden rounded-lg bg-[var(--spark-gold)] px-6 text-[15px] font-semibold text-[var(--spark-ink)] transition-transform hover:-translate-y-px"
          >
            <span
              aria-hidden
              className="spark-glare pointer-events-none absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />
            <span className="relative">Start reading</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="relative"
            >
              <path d="M5 12h13M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="mt-12 max-w-[560px] border-t border-white/[0.07] pt-10">
          <p className="spark-eyebrow mb-4 text-[var(--spark-on-dark-muted)]">
            + Know when it is finished
          </p>
          <SparkWaitlistForm />
        </div>
      </div>
    </div>
  );
}
