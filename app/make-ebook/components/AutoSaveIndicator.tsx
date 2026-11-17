"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/studio.module.css";

interface AutoSaveIndicatorProps {
  isDirty: boolean;
  hasFailed?: boolean;
  cloudPending?: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  compact?: boolean;
  hasCloudSync?: boolean;
}

const SAVING_DELAY_MS = 400;

function formatLastSaved(date: Date) {
  const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  if (diffSecs < 10) return "just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AutoSaveIndicator({
  isDirty,
  hasFailed = false,
  cloudPending = false,
  isSaving,
  lastSaved,
  compact = false,
  hasCloudSync = false,
}: AutoSaveIndicatorProps) {
  const busy = isSaving || isDirty;
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => setSlow(true), SAVING_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      setSlow(false);
    };
  }, [busy]);

  let dot = styles.savedDot;
  let label: string;
  let title: string;

  if (hasFailed && isDirty && !isSaving) {
    dot = `${styles.savedDot} ${styles.dirtyDot}`;
    label = "Not saved, retrying";
    title = "The last save failed. It will try again shortly.";
  } else if (busy && slow) {
    dot = `${styles.savedDot} ${styles.savingDot}`;
    label = "Saving…";
    title = "Saving";
  } else if (lastSaved) {
    label =
      hasCloudSync && !cloudPending
        ? "Saved and synced"
        : "Saved on this device";
    title = `Saved ${formatLastSaved(lastSaved)}`;
  } else {
    dot = `${styles.savedDot} ${styles.savingDot}`;
    label = "Saves as you type";
    title = "Your book saves on this device as you write";
  }

  return (
    <span
      className={styles.saved}
      title={title}
      aria-live="polite"
      data-save-state={
        hasFailed && isDirty && !isSaving
          ? "failed"
          : busy
            ? "saving"
            : lastSaved
              ? "saved"
              : "idle"
      }
    >
      <span className={dot} />
      {!compact && <span className={styles.savedLabel}>{label}</span>}
    </span>
  );
}

export default AutoSaveIndicator;
