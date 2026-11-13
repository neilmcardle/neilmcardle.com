"use client";

import React, { useRef } from "react";
import { useSlidingPill } from "../hooks/useSlidingPill";
import styles from "../styles/studio.module.css";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  label: string;
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  onIntent?: () => void;
}

export default function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  onIntent,
}: SegmentedProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null);
  const index = options.findIndex((o) => o.value === value);
  useSlidingPill(groupRef, index);

  return (
    <div
      ref={groupRef}
      className={styles.seg}
      data-pill
      role="group"
      aria-label={label}
      onPointerEnter={onIntent}
      onFocus={onIntent}
    >
      <span className={styles.segPill} aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          data-pill-item
          aria-pressed={value === o.value}
          className={`${styles.segItem} ${value === o.value ? styles.segActive : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
