"use client";

import React from "react";
import ChapterCompleteToggle from "./ChapterCompleteToggle";
import styles from "../styles/studio.module.css";

interface ChapterRowProps extends React.HTMLAttributes<HTMLDivElement> {
  numberLabel: string;
  title: string;
  words?: number;
  current: boolean;
  completed: boolean;
  selecting: boolean;
  checked: boolean;
  dropTarget?: boolean;
  onOpen: () => void;
  onToggleSelect: () => void;
  onToggleComplete?: () => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export default function ChapterRow({
  numberLabel,
  title,
  words,
  current,
  completed,
  selecting,
  checked,
  dropTarget = false,
  onOpen,
  onToggleSelect,
  onToggleComplete,
  leading,
  trailing,
  className = "",
  ...rest
}: ChapterRowProps) {
  const state = dropTarget
    ? styles.chapterRowDrop
    : selecting
      ? checked
        ? styles.chapterRowChecked
        : ""
      : current
        ? styles.chapterRowActive
        : "";

  return (
    <div
      className={`group ${styles.chapterRow} ${state} ${className}`}
      {...rest}
    >
      {!selecting && leading}
      <button
        type="button"
        className={styles.chapterRowMain}
        onClick={selecting ? onToggleSelect : onOpen}
        role={selecting ? "checkbox" : undefined}
        aria-checked={selecting ? checked : undefined}
        aria-current={!selecting && current ? "true" : undefined}
      >
        {selecting ? (
          <span
            className={`${styles.checkbox} ${checked ? styles.checkboxOn : ""}`}
            aria-hidden="true"
          >
            {checked && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="4 12 9 17 20 6" />
              </svg>
            )}
          </span>
        ) : (
          <span className={styles.chapterNum}>{numberLabel}</span>
        )}
        <span className={styles.chapterName} title={title}>
          {title}
        </span>
        {words !== undefined && (
          <span className={styles.chapterWords}>{words.toLocaleString()}</span>
        )}
      </button>
      {onToggleComplete && (
        <ChapterCompleteToggle
          completed={completed}
          onToggle={onToggleComplete}
        />
      )}
      {!selecting && trailing}
    </div>
  );
}
