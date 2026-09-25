"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { scrollContainer } from "@/lib/spark/scrollContainer";
import { SparkMark } from "./SparkMark";

export interface ShellSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LessonShellProps {
  title: string;
  moduleNumber: number;
  phaseLabel: string;
  promise: string;
  minutes: number;
  sections: ShellSection[];
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export function LessonShell({
  title,
  moduleNumber,
  phaseLabel,
  promise,
  minutes,
  sections,
  prev,
  next,
}: LessonShellProps) {
  const [active, setActive] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const nodes = useRef<Array<HTMLElement | null>>([]);
  const spineRef = useRef<HTMLElement | null>(null);
  const dots = useRef<Array<HTMLElement | null>>([]);
  const [spine, setSpine] = useState({ top: 0, track: 0, fill: 0 });
  const storageKey = `spark_progress_m${moduleNumber}`;

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!Number.isNaN(parsed))
        setFurthest(Math.min(parsed, sections.length - 1));
    }
  }, [storageKey, sections.length]);

  useEffect(() => {
    const elements = nodes.current.filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const container = scrollContainer(elements[0]);
    let frame = 0;

    const measure = () => {
      frame = 0;
      const anchor = window.innerHeight * 0.32;
      let candidate = 0;

      elements.forEach((element, i) => {
        if (element.getBoundingClientRect().top <= anchor) candidate = i;
      });

      setActive(candidate);
      setFurthest((prev) => (candidate > prev ? candidate : prev));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sections.length]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(furthest));
    if (furthest >= sections.length - 1) {
      window.localStorage.setItem(
        `spark_module_${moduleNumber}_complete`,
        "true",
      );
    }
  }, [furthest, storageKey, moduleNumber, sections.length]);

  useEffect(() => {
    const centre = (dot: HTMLElement | null) =>
      dot ? dot.offsetTop + dot.offsetHeight / 2 : 0;

    const remeasure = () => {
      const marks = dots.current.filter(Boolean) as HTMLElement[];
      if (marks.length === 0) return;

      const first = centre(marks[0]);
      const last = centre(marks[marks.length - 1]);
      const current = centre(dots.current[Math.min(active, marks.length - 1)]);

      setSpine({
        top: first,
        track: Math.max(0, last - first),
        fill: Math.max(0, Math.min(current, last) - first),
      });
    };

    remeasure();

    const node = spineRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(remeasure);
    observer.observe(node);
    dots.current.forEach(
      (dot) => dot?.parentElement && observer.observe(dot.parentElement),
    );
    return () => observer.disconnect();
  }, [active, sections.length]);

  const jumpTo = useCallback((index: number) => {
    const node = nodes.current[index];
    if (!node) return;
    node.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    node.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const el = event.target as HTMLElement | null;
      if (
        el &&
        (el.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))
      ) {
        return;
      }

      if (event.key === "j") {
        event.preventDefault();
        jumpTo(Math.min(sections.length - 1, active + 1));
      } else if (event.key === "k") {
        event.preventDefault();
        jumpTo(Math.max(0, active - 1));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, jumpTo, sections.length]);

  const progress =
    sections.length > 0 ? ((active + 1) / sections.length) * 100 : 0;
  const remaining = Math.max(
    1,
    Math.round(
      (minutes * (sections.length - active)) / Math.max(1, sections.length),
    ),
  );

  return (
    <div className="spark-page min-h-screen bg-[var(--spark-sheet)] text-[var(--spark-text)]">
      <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-[var(--spark-rule)]">
        <div
          className="h-full bg-[var(--spark-phosphor)] transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-[288px] shrink-0 flex-col border-r border-[var(--spark-rule)] bg-[var(--spark-pad)] px-6 py-7 lg:flex">
          <Link href="/spark" className="mb-9 flex items-center gap-2">
            <SparkMark className="h-[18px] w-auto shrink-0 text-[var(--spark-phosphor)]" />
            <span className="spark-display text-[19px] leading-none">
              spark
            </span>
          </Link>

          <span className="spark-eyebrow mb-2 text-[var(--spark-faint)]">
            Module {String(moduleNumber).padStart(2, "0")}
          </span>
          <h2 className="spark-display mb-2 text-[24px] leading-[1.08]">
            {title}
          </h2>
          <p className="mb-6 text-[12px] text-[var(--spark-muted)]">
            {phaseLabel}
          </p>

          <div className="mb-6 flex items-baseline gap-2 border-y border-[var(--spark-rule)] py-3">
            <span className="spark-display text-[26px] leading-none">
              {Math.round(progress)}%
            </span>
            <span className="spark-eyebrow text-[var(--spark-faint)]">
              read {String.fromCharCode(183)} {remaining} min left
            </span>
          </div>

          <nav
            ref={spineRef}
            aria-label="Sections"
            className="relative min-h-0 flex-1 overflow-y-auto pr-1"
          >
            <span
              aria-hidden
              className="absolute left-[6px] w-px bg-[var(--spark-grid)]"
              style={{ top: spine.top, height: spine.track }}
            />
            <span
              aria-hidden
              className="absolute left-[6px] w-px bg-[var(--spark-phosphor)] transition-[height] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{ top: spine.top, height: spine.fill }}
            />

            {sections.map((section, i) => {
              const isCurrent = i === active;
              const isRead = i < active;

              return (
                <button
                  key={section.id}
                  onClick={() => jumpTo(i)}
                  aria-current={isCurrent ? "true" : undefined}
                  className="group mb-4 grid w-full grid-cols-[13px_minmax(0,1fr)] items-start gap-3 text-left"
                >
                  <span
                    aria-hidden
                    ref={(node) => {
                      dots.current[i] = node;
                    }}
                    className="relative z-10 mt-[3px] h-[13px] w-[13px] shrink-0 rounded-full transition-all duration-300"
                    style={
                      isCurrent
                        ? {
                            background: "var(--spark-phosphor)",
                            boxShadow: "0 0 0 3px rgba(59,232,107,0.16)",
                          }
                        : isRead
                          ? { background: "var(--spark-text)" }
                          : {
                              border: "1px solid var(--spark-faint)",
                              background: "var(--spark-pad)",
                            }
                    }
                  />
                  <span
                    className={`text-[13px] leading-[1.45] transition-colors group-hover:text-[var(--spark-text)] ${
                      isCurrent
                        ? "font-semibold text-[var(--spark-text)]"
                        : isRead
                          ? "text-[var(--spark-muted)]"
                          : "text-[var(--spark-faint)]"
                    }`}
                  >
                    {section.title}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 flex h-[56px] items-center justify-between border-b border-[var(--spark-rule)] bg-[var(--spark-sheet)]/90 px-5 backdrop-blur-sm lg:px-10">
            <Link
              href="/spark/lessons"
              className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--spark-muted)] transition-colors hover:text-[var(--spark-text)]"
            >
              <SparkMark className="h-[14px] w-auto shrink-0 text-[var(--spark-phosphor)] lg:hidden" />
              Curriculum
            </Link>
            <span className="spark-eyebrow tabular-nums text-[var(--spark-faint)] lg:hidden">
              {active + 1} of {sections.length}
            </span>

            <div className="hidden items-center gap-1 lg:flex">
              <kbd className="spark-mono mr-2 rounded border border-[var(--spark-rule)] px-1.5 py-0.5 text-[10.5px] text-[var(--spark-faint)]">
                J
              </kbd>
              <kbd className="spark-mono mr-3 rounded border border-[var(--spark-rule)] px-1.5 py-0.5 text-[10.5px] text-[var(--spark-faint)]">
                K
              </kbd>
              <span className="spark-eyebrow mr-1 tabular-nums text-[var(--spark-faint)]">
                {active + 1} of {sections.length}
              </span>
              <button
                onClick={() => jumpTo(Math.max(0, active - 1))}
                disabled={active === 0}
                aria-label="Previous section"
                className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--spark-muted)] transition-colors hover:bg-[var(--spark-pad)] hover:text-[var(--spark-text)] disabled:pointer-events-none disabled:opacity-30"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() =>
                  jumpTo(Math.min(sections.length - 1, active + 1))
                }
                disabled={active >= sections.length - 1}
                aria-label="Next section"
                className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--spark-muted)] transition-colors hover:bg-[var(--spark-pad)] hover:text-[var(--spark-text)] disabled:pointer-events-none disabled:opacity-30"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </header>

          <div className="px-5 pb-32 pt-12 lg:px-10 lg:pb-24">
            <div className="mx-auto max-w-[680px]">
              <div className="mb-14">
                <span className="spark-eyebrow mb-3 block text-[var(--spark-faint)] lg:hidden">
                  Module {String(moduleNumber).padStart(2, "0")}
                </span>
                <h1 className="spark-display mb-5 text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.02]">
                  {title}
                </h1>
                {promise && (
                  <p className="text-[19px] leading-[1.5] text-[var(--spark-muted)]">
                    {promise}
                  </p>
                )}
                <p className="spark-eyebrow mt-5 text-[var(--spark-faint)]">
                  <span className="lg:hidden">
                    {phaseLabel} {String.fromCharCode(183)}{" "}
                  </span>
                  {sections.length} sections {String.fromCharCode(183)} about{" "}
                  {minutes} minutes
                </p>
              </div>

              {sections.map((section, i) => (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(node) => {
                    nodes.current[i] = node;
                  }}
                  tabIndex={-1}
                  aria-label={section.title}
                  data-focused={i === active}
                  className="spark-section mb-16 scroll-mt-24 focus:outline-none"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="spark-eyebrow text-[var(--spark-phosphor)]">
                      {String(i + 1).padStart(2, "0")} /{" "}
                      {String(sections.length).padStart(2, "0")}
                    </span>
                    <span
                      aria-hidden
                      className="h-px flex-1 bg-[var(--spark-rule)]"
                    />
                  </div>
                  <h2 className="spark-display mb-5 text-[28px] leading-[1.12]">
                    {section.title}
                  </h2>
                  {section.content}
                </section>
              ))}

              {next && (
                <Link
                  href={`/spark/lessons/${next.slug}`}
                  className="spark-grid group block rounded-xl border border-[var(--spark-rule)] p-3 transition-colors hover:border-[var(--spark-text)]"
                >
                  <span className="flex flex-col gap-4 rounded-lg border border-[var(--spark-rule)] bg-[var(--spark-sheet)] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      <span className="spark-eyebrow mb-2 block text-[var(--spark-faint)]">
                        Up next
                      </span>
                      <span className="spark-display block text-[24px] leading-[1.12]">
                        {next.title}
                      </span>
                    </span>
                    <span className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-md bg-[var(--spark-phosphor)] px-5 text-[14px] font-semibold text-[var(--spark-sheet)] transition-colors group-hover:bg-[var(--spark-phosphor-dim)]">
                      Next module
                    </span>
                  </span>
                </Link>
              )}

              {prev && (
                <Link
                  href={`/spark/lessons/${prev.slug}`}
                  className="mt-4 flex items-center gap-2.5 rounded-lg px-1 py-3 text-[13.5px] text-[var(--spark-muted)] transition-colors hover:text-[var(--spark-text)]"
                >
                  <span className="spark-eyebrow shrink-0 text-[var(--spark-faint)]">
                    Previously
                  </span>
                  <span className="min-w-0 truncate font-medium">
                    {prev.title}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav
        aria-label="Section progress"
        className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[var(--spark-sheet)] via-[var(--spark-sheet)] to-transparent px-4 pb-6 pt-4 lg:hidden"
      >
        <div className="flex items-center gap-2.5 rounded-full border border-[var(--spark-rule)] bg-[var(--spark-pad)] px-3.5 py-1.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.75)]">
          <span className="spark-eyebrow shrink-0 tabular-nums text-[var(--spark-phosphor)]">
            {active + 1}/{sections.length}
          </span>
          <div className="flex h-11 min-w-0 flex-1 items-center gap-[3px]">
            {sections.map((section, i) => (
              <button
                key={section.id}
                onClick={() => jumpTo(i)}
                aria-label={`Go to ${section.title}`}
                className="h-11 flex-1"
              >
                <span
                  aria-hidden
                  className="block w-full rounded-sm transition-all duration-300"
                  style={{
                    height: i === active ? 5 : 3,
                    background:
                      i === active
                        ? "var(--spark-phosphor)"
                        : i < active
                          ? "var(--spark-text)"
                          : "var(--spark-grid)",
                  }}
                />
              </button>
            ))}
          </div>
          <button
            onClick={() => jumpTo(Math.min(sections.length - 1, active + 1))}
            aria-label="Next section"
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[var(--spark-phosphor)]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--spark-sheet)"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </nav>
    </div>
  );
}
