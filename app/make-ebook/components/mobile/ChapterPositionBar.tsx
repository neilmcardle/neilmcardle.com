"use client";

import React, { useRef } from "react";

interface ChapterPositionBarProps {
  count: number;
  selectedChapter: number;
  onSelectChapter: (index: number) => void;
}

const SWIPE_THRESHOLD_PX = 44;

export default function ChapterPositionBar({
  count,
  selectedChapter,
  onSelectChapter,
}: ChapterPositionBarProps) {
  const startX = useRef<number | null>(null);

  if (count < 2) return null;

  const step = (direction: -1 | 1) => {
    const next = selectedChapter + direction;
    if (next < 0 || next >= count) return;
    onSelectChapter(next);
  };

  return (
    <div
      className="flex items-center gap-1 px-4 py-2 touch-pan-y select-none"
      onTouchStart={(e) => {
        startX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const from = startX.current;
        startX.current = null;
        if (from === null) return;
        const delta = (e.changedTouches[0]?.clientX ?? from) - from;
        if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
        step(delta < 0 ? 1 : -1);
      }}
    >
      {Array.from({ length: count }, (_, i) => {
        const isCurrent = i === selectedChapter;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelectChapter(i)}
            aria-label={`Go to chapter ${i + 1}`}
            aria-current={isCurrent ? "true" : undefined}
            className="flex-1 min-w-0 h-6 flex items-center"
          >
            <span
              className={`block w-full rounded-full transition-all duration-300 ease-out motion-reduce:transition-none ${
                isCurrent
                  ? "h-[3px] bg-gray-900 dark:bg-white"
                  : "h-[2px] bg-gray-200 dark:bg-[#3a3a3a]"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
