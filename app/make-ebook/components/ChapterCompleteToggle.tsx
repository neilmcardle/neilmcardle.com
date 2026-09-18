"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/studio.module.css";

interface ChapterCompleteToggleProps {
  completed: boolean;
  onToggle: () => void;
}

const CELEBRATE_MS = 560;

export default function ChapterCompleteToggle({
  completed,
  onToggle,
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

  const label = completed ? "Complete. Mark as draft" : "Draft. Mark complete";

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
      className={styles.statusToggle}
    >
      {celebrate && (
        <span
          aria-hidden="true"
          className={`${styles.statusRing} me-ring-out`}
        />
      )}
      <span
        className={`${styles.statusMark} ${completed ? styles.statusMarkDone : ""} ${
          celebrate ? "me-tick-pop" : ""
        }`}
      >
        {completed && (
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline
              points="4 12 9 17 20 6"
              className={celebrate ? "me-tick-draw" : ""}
            />
          </svg>
        )}
      </span>
    </button>
  );
}
