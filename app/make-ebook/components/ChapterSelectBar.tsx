"use client";

import React from "react";
import type { ChapterSelection } from "../hooks/useChapterSelection";
import styles from "../styles/studio.module.css";

interface ChapterSelectBarProps {
  selection: ChapterSelection;
  onComplete: (ids: Set<string>, completed: boolean) => void;
  onDelete: (ids: Set<string>, done: () => void) => void;
}

export default function ChapterSelectBar({
  selection,
  onComplete,
  onDelete,
}: ChapterSelectBarProps) {
  const { count, allSelected, selected } = selection;
  const none = count === 0;

  return (
    <div
      className={styles.selectBar}
      role="toolbar"
      aria-label="Selected chapters"
    >
      <div className={styles.selectBarTop}>
        <button
          type="button"
          className={styles.textButton}
          onClick={allSelected ? selection.clear : selection.selectAll}
        >
          {allSelected ? "Clear" : "Select all"}
        </button>
        <span aria-live="polite">
          {none ? "Tap chapters to select" : `${count} selected`}
        </span>
      </div>
      <div className={styles.selectBarActions}>
        <button
          type="button"
          className={styles.btn}
          disabled={none}
          onClick={() => {
            onComplete(selected, true);
            selection.stop();
          }}
        >
          Mark complete
        </button>
        <button
          type="button"
          className={styles.btn}
          disabled={none}
          onClick={() => {
            onComplete(selected, false);
            selection.stop();
          }}
        >
          Mark draft
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnDanger}`}
          disabled={none || allSelected}
          title={allSelected ? "A book needs at least one chapter" : undefined}
          onClick={() => onDelete(selected, selection.stop)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
