"use client";

import React from "react";
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
  let dot = styles.savedDot;
  let label: string | null = null;
  let title = "";

  if (hasFailed && isDirty && !isSaving) {
    dot = `${styles.savedDot} ${styles.dirtyDot}`;
    label = "Not saved, retrying";
    title = "The last save failed. It will try again shortly.";
  } else if (isSaving || isDirty) {
    dot = `${styles.savedDot} ${styles.savingDot}`;
    label = "Saving…";
    title = "Saving";
  } else if (lastSaved) {
    label =
      hasCloudSync && !cloudPending
        ? "Saved and synced"
        : "Saved on this device";
    title = `Saved ${formatLastSaved(lastSaved)}`;
  }

  if (!label) return null;

  return (
    <span className={styles.saved} title={title} aria-live="polite">
      <span className={dot} />
      {!compact && <span className={styles.savedLabel}>{label}</span>}
    </span>
  );
}

export default AutoSaveIndicator;
