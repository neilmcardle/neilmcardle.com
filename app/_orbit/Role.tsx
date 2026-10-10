"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./orbit.module.css";

const ROLE = "Senior Digital Product Designer, London, UK";

export default function Role() {
  const boxRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;
    const measure = () => {
      const pad = parseFloat(getComputedStyle(text).paddingRight) || 0;
      setOverflow(
        text.getBoundingClientRect().width - pad > box.clientWidth + 1,
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
      className={styles.role}
      data-overflow={overflow || undefined}
    >
      <span className={styles.roleTrack}>
        <span ref={textRef}>{ROLE}</span>
        <span className={styles.roleCopy} aria-hidden="true">
          {ROLE}
        </span>
      </span>
    </span>
  );
}
