"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PHASES, type Phase } from "@/lib/spark/curriculum";

export interface CurriculumEntry {
  slug: string;
  title: string;
  module: number;
  promise: string;
  phaseId: string;
  sectionCount: number;
  minutes: number;
}

interface CurriculumIndexProps {
  modules: CurriculumEntry[];
}

interface Progress {
  furthest: number;
  complete: boolean;
}

const EMPTY: Progress = { furthest: 0, complete: false };

export function CurriculumIndex({ modules }: CurriculumIndexProps) {
  const [progress, setProgress] = useState<Record<number, Progress>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const next: Record<number, Progress> = {};
    modules.forEach((mod) => {
      const furthest = parseInt(
        window.localStorage.getItem(`spark_progress_m${mod.module}`) ?? "0",
        10,
      );
      next[mod.module] = {
        furthest: Number.isNaN(furthest) ? 0 : furthest,
        complete:
          window.localStorage.getItem(`spark_module_${mod.module}_complete`) ===
          "true",
      };
    });
    setProgress(next);
    setLoaded(true);
  }, [modules]);

  const completedCount = useMemo(
    () => modules.filter((m) => progress[m.module]?.complete).length,
    [modules, progress],
  );

  const resume = useMemo(() => {
    const started = modules.find(
      (m) =>
        !progress[m.module]?.complete &&
        (progress[m.module]?.furthest ?? 0) > 0,
    );
    if (started) return started;
    return modules.find((m) => !progress[m.module]?.complete) ?? modules[0];
  }, [modules, progress]);

  const minutesLeft = useMemo(
    () =>
      modules
        .filter((m) => !progress[m.module]?.complete)
        .reduce((total, m) => total + m.minutes, 0),
    [modules, progress],
  );

  const grouped = useMemo(
    () =>
      PHASES.map((phase) => ({
        phase,
        modules: modules.filter((m) => m.phaseId === phase.id),
      })).filter((group) => group.modules.length > 0),
    [modules],
  );

  const percent =
    modules.length > 0
      ? Math.round((completedCount / modules.length) * 100)
      : 0;
  const resumeProgress = resume ? (progress[resume.module] ?? EMPTY) : EMPTY;

  return (
    <div className="min-h-screen bg-[var(--spark-ink)] text-white">
      <header className="flex h-[60px] items-center justify-between border-b border-white/[0.07] px-5 lg:px-14">
        <Link href="/spark" className="flex items-center gap-2.5">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--spark-gold)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z" />
          </svg>
          <span className="font-serif text-[15px] font-black uppercase tracking-[0.08em]">
            Spark
          </span>
        </Link>
        <span className="spark-eyebrow text-white/40">
          {loaded
            ? `${completedCount} of ${modules.length} complete`
            : `${modules.length} modules`}
        </span>
      </header>

      <div className="px-5 pb-10 pt-12 lg:px-14 lg:pt-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="spark-eyebrow mb-5 block text-[var(--spark-gold)]">
              + The curriculum
            </span>
            <h1 className="mb-4 font-serif text-[clamp(2.75rem,9vw,4.25rem)] font-black uppercase leading-[0.94] tracking-[-0.03em]">
              Nineteen
              <br />
              modules
            </h1>
            <p className="max-w-[440px] font-serif text-[19px] italic leading-[1.45] text-white/55">
              Fundamentals up. From how a file becomes a page, to a full stack
              capstone shipped without AI.
            </p>
          </div>

          <div className="flex gap-9 lg:gap-11">
            <div>
              <div className="font-serif text-[42px] font-black leading-none tracking-[-0.03em] text-[var(--spark-gold)]">
                {loaded ? completedCount : "·"}
              </div>
              <div className="spark-eyebrow mt-2 text-white/[0.38]">Done</div>
            </div>
            <div>
              <div className="font-serif text-[42px] font-black leading-none tracking-[-0.03em]">
                {loaded ? percent : "·"}
                <span className="text-[22px] text-white/40">%</span>
              </div>
              <div className="spark-eyebrow mt-2 text-white/[0.38]">
                Of the course
              </div>
            </div>
            <div>
              <div className="font-serif text-[42px] font-black leading-none tracking-[-0.03em]">
                {Math.round(minutesLeft / 60)}
                <span className="text-[22px] text-white/40">h</span>
              </div>
              <div className="spark-eyebrow mt-2 text-white/[0.38]">Left</div>
            </div>
          </div>
        </div>

        {resume && (
          <Link
            href={`/spark/lessons/${resume.slug}`}
            className="relative mt-10 flex flex-col gap-5 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.04] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <span
              aria-hidden
              className="spark-glare pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[var(--spark-gold)]/10 to-transparent"
            />
            <span className="relative">
              <span className="spark-eyebrow mb-2 block text-[var(--spark-gold)]">
                {resumeProgress.furthest > 0
                  ? "+ Pick up where you left off"
                  : "+ Start here"}
              </span>
              <span className="block font-serif text-[26px] font-bold leading-[1.1] tracking-[-0.02em]">
                {resume.title}
              </span>
              <span className="mt-1.5 block text-[12.5px] text-white/45">
                Section{" "}
                {Math.min(resumeProgress.furthest + 1, resume.sectionCount)} of{" "}
                {resume.sectionCount} {String.fromCharCode(183)}{" "}
                {resume.minutes} min
              </span>
            </span>
            <span className="relative flex min-h-[44px] shrink-0 items-center justify-center gap-2.5 rounded-full bg-[var(--spark-gold)] px-6 text-[13.5px] font-semibold text-[var(--spark-ink)]">
              {resumeProgress.furthest > 0 ? "Resume" : "Begin"}
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
              >
                <path d="M5 12h13M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        )}
      </div>

      <div className="px-5 pb-20 lg:px-14">
        {grouped.map(({ phase, modules: group }) => (
          <PhaseGroup
            key={phase.id}
            phase={phase}
            modules={group}
            progress={progress}
            loaded={loaded}
          />
        ))}
      </div>
    </div>
  );
}

function PhaseGroup({
  phase,
  modules,
  progress,
  loaded,
}: {
  phase: Phase;
  modules: CurriculumEntry[];
  progress: Record<number, Progress>;
  loaded: boolean;
}) {
  const done = modules.filter((m) => progress[m.module]?.complete).length;
  const index = PHASES.indexOf(phase);
  const active = loaded && done < modules.length && done > 0;

  return (
    <section className="mb-8">
      <div className="mb-1 flex items-center gap-4">
        <h2
          className="spark-eyebrow shrink-0"
          style={{
            color: active ? "var(--spark-gold)" : "rgba(255,255,255,0.4)",
          }}
        >
          + Phase {index} {String.fromCharCode(183)} {phase.name}
        </h2>
        <span aria-hidden className="h-px flex-1 bg-white/[0.09]" />
        <span className="spark-eyebrow shrink-0 text-white/30">
          {loaded
            ? `${done} of ${modules.length}`
            : `${modules.length} modules`}
        </span>
      </div>

      {modules.map((mod) => {
        const state = progress[mod.module] ?? EMPTY;
        const started = state.furthest > 0 && !state.complete;

        return (
          <Link
            key={mod.slug}
            href={`/spark/lessons/${mod.slug}`}
            className="group grid grid-cols-[54px_minmax(0,1fr)] items-start gap-4 border-b border-white/[0.05] py-4 transition-colors hover:bg-white/[0.035] lg:grid-cols-[86px_minmax(0,1fr)_200px_118px_32px] lg:items-center lg:gap-6 lg:pl-2"
          >
            <span
              className="mt-0.5 font-serif text-[28px] font-black leading-none tracking-[-0.03em] transition-colors lg:mt-0 lg:text-[38px]"
              style={{
                color: started
                  ? "rgba(216,180,106,0.55)"
                  : state.complete
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(255,255,255,0.09)",
              }}
            >
              {String(mod.module).padStart(2, "0")}
            </span>

            <span className="min-w-0">
              <span className="block font-serif text-[19px] font-bold leading-[1.15] tracking-[-0.015em] lg:text-[22px]">
                {mod.title}
              </span>
              {mod.promise && (
                <span className="mt-1 block text-[12.5px] leading-[1.5] text-white/[0.38] line-clamp-2">
                  {mod.promise}
                </span>
              )}
              <span className="mt-2 flex items-center gap-1.5 lg:hidden">
                <SectionDots
                  total={mod.sectionCount}
                  read={state.complete ? mod.sectionCount : state.furthest}
                  active={started}
                  compact
                />
                <span className="ml-1.5 shrink-0 text-[10px] text-white/30">
                  {state.complete ? "Complete" : `${mod.minutes} min`}
                </span>
              </span>
            </span>

            <span className="hidden items-center gap-[3px] lg:flex">
              <SectionDots
                total={mod.sectionCount}
                read={state.complete ? mod.sectionCount : state.furthest}
                active={started}
              />
            </span>

            <span className="hidden text-right lg:block">
              {state.complete ? (
                <span className="spark-eyebrow text-[var(--spark-gold-deep)]">
                  Complete
                </span>
              ) : started ? (
                <span className="rounded-full border border-[var(--spark-gold)]/30 bg-[var(--spark-gold)]/[0.13] px-3 py-1 text-[11px] font-medium text-[var(--spark-gold)]">
                  {mod.minutes} min left
                </span>
              ) : (
                <span className="text-[11px] text-white/[0.26]">
                  {mod.minutes} min
                </span>
              )}
            </span>

            <span className="hidden justify-end opacity-35 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 lg:flex">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h13M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        );
      })}
    </section>
  );
}

function SectionDots({
  total,
  read,
  active,
  compact = false,
}: {
  total: number;
  read: number;
  active: boolean;
  compact?: boolean;
}) {
  const capped = Math.min(total, compact ? 12 : 20);

  return (
    <>
      {Array.from({ length: capped }, (_, i) => {
        const isRead = i < read;
        const isCurrent = active && i === read;
        return (
          <span
            key={i}
            aria-hidden
            className="rounded-sm"
            style={{
              width: isCurrent ? (compact ? 12 : 16) : compact ? 7 : 11,
              height: compact ? 2.5 : 3,
              background: isCurrent
                ? "var(--spark-gold)"
                : isRead
                  ? "var(--spark-gold-deep)"
                  : "rgba(255,255,255,0.13)",
            }}
          />
        );
      })}
    </>
  );
}
