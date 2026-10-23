"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./orbit.module.css";

const LINES: ((copy: boolean) => ReactNode)[] = [
  () =>
    "Product designer and builder focused on complex interfaces, design systems, and AI-native products.",
];

const NARROW =
  "Product designer and builder focused on complex interfaces, design systems, and AI-native products.";

function Line({
  render,
  className,
}: {
  render: (copy: boolean) => ReactNode;
  className: string;
}) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    const inner = textRef.current;
    if (!box || !inner) return;
    const measure = () => {
      const pad = parseFloat(getComputedStyle(inner).paddingRight) || 0;
      setOverflow(
        inner.getBoundingClientRect().width - pad > box.clientWidth + 1,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={boxRef}
      className={`${styles.role} ${className}`}
      data-overflow={overflow || undefined}
    >
      <span className={styles.roleTrack}>
        <span ref={textRef}>{render(false)}</span>
        <span className={styles.roleCopy} aria-hidden="true">
          {render(true)}
        </span>
      </span>
    </span>
  );
}

export default function Role() {
  return (
    <>
      {LINES.map((render, i) => (
        <Line key={i} render={render} className={styles.roleWide} />
      ))}
      <Line render={() => NARROW} className={styles.roleNarrow} />
    </>
  );
}
