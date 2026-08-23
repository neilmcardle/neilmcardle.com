"use client";

import React, { useEffect, useRef, useState } from "react";

interface ChapterCompleteToggleProps {
  completed: boolean;
  onToggle: () => void;
  selected?: boolean;
  hitArea?: "tight" | "touch";
}

const CELEBRATE_MS = 560;

export default function ChapterCompleteToggle({
  completed,
  onToggle,
  selected = false,
  hitArea = "tight",
}: ChapterCompleteToggleProps) {
  const previous = useRef(completed);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (completed && !previous.current) {
      setCelebrate(true);
      const timer = window.setTimeout(() => setCelebrate(false), CELEBRATE_MS);
      previous.current = completed;
      return () => window.clearTimeout(timer);
    }
    previous.current = completed;
  }, [completed]);

  const label = completed
    ? "Mark as still in progress"
    : "Mark chapter complete";

  const circleTone = completed
    ? selected
      ? "bg-white dark:bg-gray-900 border-transparent text-gray-900 dark:text-white"
      : "bg-gray-900 dark:bg-white border-transparent text-white dark:text-gray-900"
    : selected
      ? "border-white/40 dark:border-gray-400 text-transparent hover:border-white/70 dark:hover:border-gray-600"
      : "border-gray-300 dark:border-[#4a4a4a] text-transparent hover:border-gray-400 dark:hover:border-[#6a6a6a]";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={completed}
      aria-label={label}
      title={label}
      className={`relative flex items-center justify-center flex-shrink-0 ${
        hitArea === "touch" ? "w-11 h-11 -ml-2" : "w-5 h-5"
      }`}
    >
      {celebrate && (
        <span
          aria-hidden="true"
          className="absolute w-5 h-5 rounded-full border-2 border-gray-900 dark:border-white me-ring-out pointer-events-none"
        />
      )}
      <span
        className={`flex items-center justify-center w-5 h-5 rounded-full border transition-colors duration-[var(--me-dur)] ${circleTone} ${
          celebrate ? "me-tick-pop" : ""
        }`}
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline
            points="4 12 9 17 20 6"
            className={celebrate ? "me-tick-draw" : ""}
          />
        </svg>
      </span>
    </button>
  );
}
