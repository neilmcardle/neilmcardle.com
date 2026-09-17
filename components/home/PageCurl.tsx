"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

export default function PageCurl() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (
        event instanceof PointerEvent &&
        ref.current?.contains(event.target as Node)
      )
        return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <button
      ref={ref}
      type="button"
      className={styles.curl}
      data-open={open ? "true" : undefined}
      aria-expanded={open}
      aria-label={open ? "neilOS coming soon" : "Peek under the page"}
      onClick={() => setOpen((value) => !value)}
    >
      <span className={styles.curlUnder}>
        <span className={styles.curlNote} aria-hidden="true">
          neilOS coming soon…
        </span>
      </span>
      <span className={styles.curlFlap}>
        <svg
          className={styles.curlClose}
          width="7"
          height="7"
          viewBox="0 0 7 7"
          aria-hidden="true"
        >
          <path
            d="M1 1l5 5M6 1l-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </button>
  );
}
