"use client";

import React, { useEffect, useState } from "react";

interface Chapter {
  id: string;
  title: string;
}

interface ChapterScrollRailProps {
  chapters: Chapter[];
  selectedChapter: number;
  onSelectChapter?: (index: number) => void;
}

export default function ChapterScrollRail({
  chapters,
  selectedChapter,
  onSelectChapter,
}: ChapterScrollRailProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const el = document.querySelector<HTMLElement>(".editor-root");
    if (!el) return;

    const read = () => {
      const scrollable = el.scrollHeight - el.clientHeight;
      setProgress(
        scrollable > 8
          ? Math.min(1, Math.max(0, el.scrollTop / scrollable))
          : 0,
      );
    };

    read();
    el.addEventListener("scroll", read, { passive: true });
    return () => el.removeEventListener("scroll", read);
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
              className={`block w-[3px] rounded-full transition-all duration-300 ${
                isCurrent
                  ? "h-7 bg-gray-200 dark:bg-[#3a3a3a]"
                  : "h-3.5 bg-gray-200 dark:bg-[#2f2f2f] group-hover:bg-gray-300 dark:group-hover:bg-[#4a4a4a]"
              }`}
            >
              {isCurrent && (
                <span
                  className="block w-full rounded-full bg-gray-900 dark:bg-white transition-[height] duration-150"
                  style={{ height: `${Math.max(18, progress * 100)}%` }}
                />
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
