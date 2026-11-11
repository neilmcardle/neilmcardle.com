"use client";

import { useEffect, useState } from "react";
import type { BookMindActivity } from "../../hooks/useBookMind";
import BookMindMark from "./BookMindMark";
import styles from "../../styles/studio.module.css";

function describeRead(read: string[], deep: boolean) {
  if (deep && read.length > 3) return "Reading the whole book closely";
  if (read.length === 0) return "Thinking";
  if (read.length === 1) return `Reading ${read[0]}`;
  if (read.length === 2) return `Reading ${read[0]} and ${read[1]}`;
  return `Reading ${read[0]} and ${read.length - 1} more`;
}

export default function PendingRow({
  read,
  deep,
  startedAt,
}: BookMindActivity) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const seconds = Math.max(0, Math.round((now - startedAt) / 1000));
  return (
    <div className={styles.bmPending} role="status">
      <BookMindMark className={styles.bmPendingMark} thinking />
      <span className={styles.bmShimmer}>{describeRead(read, deep)}</span>
      {seconds > 1 && <span className={styles.bmPendingTime}>{seconds}s</span>}
    </div>
  );
}
