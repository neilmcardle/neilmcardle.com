"use client";

import React, { useEffect, useRef, useState } from "react";

interface Chapter {
  id: string;
  title: string;
}

interface ChapterScrollRailProps {
  chapters: Chapter[];
  selectedChapter: number;
  onSelectChapter?: (index: number) => void;
}

const THUMB_RATIO = 0.45;

export default function ChapterScrollRail({
  chapters,
  selectedChapter,
  onSelectChapter,
}: ChapterScrollRailProps) {
  const [progress, setProgress] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const idleTimer = useRef<number | null>(null);

  useEffect(() => {
    setProgress(0);
    const el =
      document.querySelector<HTMLElement>(
        '[data-tour="editor"] .editor-root[contenteditable]',
      ) ??
      [...document.querySelectorAll<HTMLElement>(".editor-root")]
        .reverse()
        .find((node) => node.offsetParent !== null);
    if (!el) return;

    const read = () => {
      const range = el.scrollHeight - el.clientHeight;
      if (range <= 8) {
        setScrollable(false);
        setProgress(0);
        return;
      }
      setScrollable(true);
      setProgress(Math.min(1, Math.max(0, el.scrollTop / range)));
    };

    const onScroll = () => {
      read();
      setScrubbing(true);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setScrubbing(false), 700);
    };

    read();
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("input", read);

    const observer = new ResizeObserver(read);
    observer.observe(el);

    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("input", read);
      observer.disconnect();
    };
  }, [selectedChapter, chapters.length]);

  if (chapters.length < 2) return null;

  return (
    <nav
      aria-label="Chapter position"
      className="hidden lg:flex flex-col items-center justify-center gap-2.5 w-7 flex-shrink-0 overflow-hidden select-none"
    >
      {chapters.map((ch, i) => {
        const isCurrent = i === selectedChapter;
        return (
          <button
            key={ch.id}
            type="button"
            onClick={() => onSelectChapter?.(i)}
            title={ch.title?.trim() || `Chapter ${i + 1}`}
            aria-label={ch.title?.trim() || `Chapter ${i + 1}`}
            aria-current={isCurrent ? "true" : undefined}
            className="group flex items-center justify-center w-5 flex-shrink-0 py-0.5"
          >
            <span
              className={`block w-[3px] rounded-full overflow-hidden transition-all duration-300 ${
                isCurrent
                  ? "h-8 bg-gray-200 dark:bg-[#3a3a3a]"
                  : "h-3.5 bg-gray-200 dark:bg-[#2f2f2f] group-hover:bg-gray-300 dark:group-hover:bg-[#4a4a4a]"
              }`}
            >
              {isCurrent && (
                <span
                  className="block w-full rounded-full bg-gray-900 dark:bg-white transition-[height,transform] duration-[var(--me-dur)] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                  style={
                    scrollable && scrubbing
                      ? {
                          height: `${THUMB_RATIO * 100}%`,
                          transform: `translateY(${(progress * (1 - THUMB_RATIO) * 100) / THUMB_RATIO}%)`,
                        }
                      : { height: "100%", transform: "translateY(0)" }
                  }
                />
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
