"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PHASES, type Phase } from "@/lib/spark/curriculum";
import { SparkMark } from "./SparkMark";

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

  const started = useMemo(
    () =>
      loaded &&
      modules.some(
        (m) =>
          progress[m.module]?.complete ||
          (progress[m.module]?.furthest ?? 0) > 0,
      ),
    [loaded, modules, progress],
  );

  const resume = useMemo(() => {
    const inFlight = modules.find(
      (m) =>
        !progress[m.module]?.complete &&
        (progress[m.module]?.furthest ?? 0) > 0,
    );
    if (inFlight) return inFlight;
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
    <div className="spark-page min-h-screen bg-[var(--spark-pad)] text-[var(--spark-text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--spark-rule)] bg-[var(--spark-pad)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-12">
          <Link href="/spark" className="flex items-center gap-2.5">
            <SparkMark className="h-[22px] w-auto shrink-0 text-[var(--spark-arc)]" />
            <span className="spark-display text-[22px] leading-none">
              spark
            </span>
          </Link>

          {started && (
            <dl className="hidden items-center gap-8 md:flex">
              <Stat label="Done" value={String(completedCount)} />
              <Stat label="Of the course" value={`${percent}%`} />
              <Stat label="Left" value={`${Math.round(minutesLeft / 60)}h`} />
            </dl>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 pb-24 md:px-12">
        <div className="pt-16 md:pt-24">
          <h1 className="spark-display m-0 max-w-[16ch] text-[clamp(2.5rem,6vw,5rem)] leading-[0.98]">
            The whole course, in order.
          </h1>
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <p className="m-0 max-w-[36em] text-[18px] leading-[1.55] text-[var(--spark-muted)]">
              Most designers can prompt their way to an app. Few can start from
              an empty file. These modules take you there, one line at a time.
            </p>
            <p className="spark-eyebrow m-0 shrink-0 text-[var(--spark-faint)]">
              {modules.length} modules {String.fromCharCode(183)}{" "}
              {PHASES.length} phases {String.fromCharCode(183)} no code needed
              to begin
            </p>
          </div>

          {started && (
            <dl className="mt-8 flex gap-8 md:hidden">
              <Stat label="Done" value={String(completedCount)} />
              <Stat label="Of the course" value={`${percent}%`} />
              <Stat label="Left" value={`${Math.round(minutesLeft / 60)}h`} />
            </dl>
          )}
        </div>

        {resume && (
          <div className="spark-grid mt-12 rounded-xl border border-[var(--spark-rule)] p-3 md:p-6">
            <Link
              href={`/spark/lessons/${resume.slug}`}
              className="group flex flex-col gap-5 rounded-lg border border-[var(--spark-rule)] bg-[var(--spark-sheet)] p-5 shadow-[0_24px_48px_-28px_rgba(27,31,25,0.35)] sm:flex-row sm:items-center sm:justify-between md:p-6"
            >
              <span>
                <span className="spark-eyebrow mb-2 block text-[var(--spark-arc)]">
                  {resumeProgress.furthest > 0
                    ? "Pick up where you left off"
                    : "Start here"}
                </span>
                <span className="spark-display block text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.08]">
                  {String(resume.module).padStart(2, "0")} {resume.title}
                </span>
                <span className="spark-eyebrow mt-2 block text-[var(--spark-faint)]">
                  Section{" "}
                  {Math.min(resumeProgress.furthest + 1, resume.sectionCount)}{" "}
                  of {resume.sectionCount} {String.fromCharCode(183)}{" "}
                  {resume.minutes} min
                </span>
              </span>
              <span className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-md bg-[var(--spark-arc)] px-6 text-[15px] font-semibold text-[var(--spark-sheet)] transition-colors group-hover:bg-[var(--spark-arc-hover)]">
                {resumeProgress.furthest > 0 ? "Resume" : "Begin"}
              </span>
            </Link>
          </div>
        )}

        <div className="mt-12 overflow-hidden rounded-xl border border-[var(--spark-rule)] bg-[var(--spark-sheet)]">
          {grouped.map(({ phase, modules: group }) => (
            <PhaseGroup
              key={phase.id}
              phase={phase}
              modules={group}
              progress={progress}
              started={started}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="spark-eyebrow mt-1 text-[var(--spark-faint)]">{label}</dt>
      <dd className="spark-display m-0 text-[22px] leading-none">{value}</dd>
    </div>
  );
}

function PhaseGroup({
  phase,
  modules,
  progress,
  started,
}: {
  phase: Phase;
  modules: CurriculumEntry[];
  progress: Record<number, Progress>;
  started: boolean;
}) {
  const done = modules.filter((m) => progress[m.module]?.complete).length;
  const index = PHASES.indexOf(phase);

  return (
    <section className="border-t border-[var(--spark-rule)] pb-3 first:border-t-0">
      <div className="flex items-baseline gap-4 px-4 pb-2 pt-6 md:px-6">
        <span className="spark-eyebrow w-9 shrink-0 text-[var(--spark-faint)] md:w-16">
          Phase {index}
        </span>
        <h2 className="spark-display m-0 flex-1 text-[19px] leading-tight">
          {phase.name}
        </h2>
        <span className="spark-eyebrow shrink-0 text-[var(--spark-faint)]">
          {started
            ? `${done} of ${modules.length}`
            : `${modules.length} modules`}
        </span>
      </div>

      <ol className="m-0 list-none p-0">
        {modules.map((mod) => {
          const state = progress[mod.module] ?? EMPTY;
          const inFlight = state.furthest > 0 && !state.complete;

          return (
            <li key={mod.slug}>
              <Link
                href={`/spark/lessons/${mod.slug}`}
                className="group grid grid-cols-[36px_minmax(0,1fr)] items-baseline gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--spark-pad)] md:grid-cols-[64px_minmax(0,1fr)_200px_96px] md:items-center md:px-6"
              >
                <span
                  className={`spark-mono text-[13px] transition-colors group-hover:text-[var(--spark-arc)] ${
                    inFlight
                      ? "text-[var(--spark-arc)]"
                      : "text-[var(--spark-faint)]"
                  }`}
                >
                  {String(mod.module).padStart(2, "0")}
                </span>

                <span className="min-w-0">
                  <span className="block text-[16px] font-semibold leading-snug">
                    {mod.title}
                  </span>
                  {mod.promise && (
                    <span className="mt-0.5 block text-[14px] leading-[1.5] text-[var(--spark-muted)]">
                      {mod.promise}
                    </span>
                  )}
                  <span className="mt-2.5 flex items-center gap-[3px] md:hidden">
                    <SectionDots
                      total={mod.sectionCount}
                      read={state.complete ? mod.sectionCount : state.furthest}
                      active={inFlight}
                      compact
                    />
                    <span className="spark-eyebrow ml-2 shrink-0 text-[var(--spark-faint)]">
                      {state.complete ? "Done" : `${mod.minutes} min`}
                    </span>
                  </span>
                </span>

                <span className="hidden items-center gap-[3px] md:flex">
                  <SectionDots
                    total={mod.sectionCount}
                    read={state.complete ? mod.sectionCount : state.furthest}
                    active={inFlight}
                  />
                </span>

                <span className="spark-eyebrow hidden text-right md:block">
                  {state.complete ? (
                    <span className="text-[var(--spark-pass)]">Done</span>
                  ) : inFlight ? (
                    <span className="text-[var(--spark-arc)]">
                      {mod.minutes} min left
                    </span>
                  ) : (
                    <span className="text-[var(--spark-faint)]">
                      {mod.minutes} min
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
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
              width: isCurrent ? (compact ? 12 : 16) : compact ? 7 : 9,
              height: 3,
              background: isCurrent
                ? "var(--spark-arc)"
                : isRead
                  ? "var(--spark-text)"
                  : "var(--spark-grid)",
            }}
          />
        );
      })}
    </>
  );
}
