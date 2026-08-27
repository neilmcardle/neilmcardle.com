"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { scrollContainer } from "@/lib/spark/scrollContainer";

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
    <div className="min-h-screen bg-[var(--spark-paper)]">
      <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-black/[0.07]">
        <div
          className="h-full bg-gradient-to-r from-[var(--spark-gold-deep)] to-[var(--spark-gold)] transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-[276px] shrink-0 flex-col bg-[var(--spark-ink)] px-6 py-8 lg:flex">
          <Link href="/spark" className="mb-8 flex items-center gap-2.5">
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
            <span className="font-serif text-[15px] font-black uppercase tracking-[0.08em] text-white">
              Spark
            </span>
          </Link>

          <span className="spark-eyebrow mb-2.5 text-[var(--spark-on-dark-muted)]">
            + Module {String(moduleNumber).padStart(2, "0")}
          </span>
          <h2 className="mb-2 font-serif text-[26px] font-bold leading-[1.06] tracking-[-0.02em] text-white">
            {title}
          </h2>
          <p className="mb-6 text-[11.5px] text-[var(--spark-on-dark-muted)]">
            {phaseLabel}
          </p>

          <div className="mb-5 flex items-baseline gap-2">
            <span className="font-serif text-[30px] font-black leading-none text-[var(--spark-gold)]">
              {Math.round(progress)}%
            </span>
            <span className="text-[11px] text-[var(--spark-on-dark-muted)]">
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
              className="absolute left-[6px] w-px bg-white/10"
              style={{ top: spine.top, height: spine.track }}
            />
            <span
              aria-hidden
              className="absolute left-[6px] w-px bg-gradient-to-b from-[var(--spark-gold-deep)] to-[var(--spark-gold)] transition-[height] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
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
                            background: "var(--spark-gold)",
                            boxShadow: "0 0 0 3px rgba(216,180,106,0.2)",
                          }
                        : isRead
                          ? { background: "var(--spark-gold-deep)" }
                          : { border: "1px solid var(--spark-rule-dark)" }
                    }
                  />
                  <span
                    className={`text-[12.5px] leading-[1.45] transition-colors group-hover:text-white/90 ${
                      isCurrent
                        ? "font-semibold text-white"
                        : isRead
                          ? "text-[var(--spark-on-dark-muted)]"
                          : "text-[var(--spark-on-dark-dim)]"
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
          <header className="spark-card sticky top-0 z-40 flex h-[54px] items-center justify-between bg-[var(--spark-paper)]/90 px-5 backdrop-blur-sm lg:px-10">
            <Link
              href="/spark/lessons"
              className="flex items-center gap-2.5 text-[12.5px] font-medium text-[var(--spark-muted)] transition-colors hover:text-[var(--spark-text)]"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Curriculum
            </Link>
            <span className="text-[11.5px] text-[var(--spark-faint)] lg:hidden">
              {active + 1} of {sections.length}
            </span>

            <div className="hidden items-center gap-1 lg:flex">
              <kbd className="spark-mono mr-2 rounded border border-black/[0.12] px-1.5 py-0.5 text-[10px] text-[var(--spark-faint)]">
                J
              </kbd>
              <kbd className="spark-mono mr-3 rounded border border-black/[0.12] px-1.5 py-0.5 text-[10px] text-[var(--spark-faint)]">
                K
              </kbd>
              <span className="mr-1 text-[11.5px] tabular-nums text-[var(--spark-faint)]">
                {active + 1} of {sections.length}
              </span>
              <button
                onClick={() => jumpTo(Math.max(0, active - 1))}
                disabled={active === 0}
                aria-label="Previous section"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--spark-muted)] transition-colors hover:bg-black/[0.05] hover:text-[var(--spark-text)] disabled:pointer-events-none disabled:opacity-25"
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
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--spark-muted)] transition-colors hover:bg-black/[0.05] hover:text-[var(--spark-text)] disabled:pointer-events-none disabled:opacity-25"
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

          <div className="px-5 pb-32 pt-10 lg:px-10 lg:pb-24">
            <div className="mx-auto max-w-[660px]">
              <div className="mb-12">
                <span className="spark-eyebrow mb-3 block text-[var(--spark-gold-ink)] lg:hidden">
                  + Module {String(moduleNumber).padStart(2, "0")}
                </span>
                <h1 className="mb-4 font-serif text-[clamp(2.5rem,7vw,3.5rem)] font-black leading-[0.96] tracking-[-0.03em] text-[var(--spark-text)]">
                  {title}
                </h1>
                {promise && (
                  <p className="font-serif text-[20px] italic leading-[1.45] text-[var(--spark-muted)]">
                    {promise}
                  </p>
                )}
                <p className="mt-5 text-[12px] text-[var(--spark-faint)]">
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
                  className="spark-section mb-14 scroll-mt-24 focus:outline-none"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="spark-eyebrow text-[var(--spark-gold-ink)]">
                      + {String(i + 1).padStart(2, "0")} /{" "}
                      {String(sections.length).padStart(2, "0")}
                    </span>
                    <span aria-hidden className="h-px flex-1 bg-black/[0.1]" />
                  </div>
                  <h2 className="mb-5 font-serif text-[32px] font-bold leading-[1.1] tracking-[-0.025em] text-[var(--spark-text)]">
                    {section.title}
                  </h2>
                  {section.content}
                </section>
              ))}

              {next && (
                <Link
                  href={`/spark/lessons/${next.slug}`}
                  className="relative block overflow-hidden rounded-xl bg-[var(--spark-ink)] p-6"
                >
                  <span
                    aria-hidden
                    className="spark-glare pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[var(--spark-gold)]/15 to-transparent"
                  />
                  <span className="spark-eyebrow relative mb-2 block text-[var(--spark-on-dark-muted)]">
                    + Up next
                  </span>
                  <span className="relative block font-serif text-[26px] font-bold leading-[1.12] tracking-[-0.02em] text-white">
                    {next.title}
                  </span>
                </Link>
              )}

              {prev && (
                <Link
                  href={`/spark/lessons/${prev.slug}`}
                  className="mt-4 flex items-center gap-2.5 rounded-lg px-1 py-3 text-[13px] text-[var(--spark-muted)] transition-colors hover:text-[var(--spark-text)]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="shrink-0"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  <span className="spark-eyebrow text-[var(--spark-faint)]">
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
        className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[var(--spark-paper)] via-[var(--spark-paper)] to-transparent px-4 pb-6 pt-4 lg:hidden"
      >
        <div className="flex items-center gap-2.5 rounded-full bg-[var(--spark-ink)] px-3.5 py-2">
          <span className="shrink-0 spark-mono text-[10.5px] text-[var(--spark-gold)]">
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
                        ? "var(--spark-gold)"
                        : i < active
                          ? "var(--spark-gold-deep)"
                          : "var(--spark-rule-dark)",
                  }}
                />
              </button>
            ))}
          </div>
          <button
            onClick={() => jumpTo(Math.min(sections.length - 1, active + 1))}
            aria-label="Next section"
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[var(--spark-gold)]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--spark-ink)"
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
