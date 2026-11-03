"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./heroCard.module.css";

const address = () => ["neil", ["neilmcardle", "com"].join(".")].join("@");

export default function HeroCard({
  name,
  line,
  place,
}: {
  name: string;
  line: string;
  place: string;
}) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address());
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${address()}`;
    }
  };

  return (
    <div className={styles.card}>
      <span className={styles.face}>
        <img
          className={styles.still}
          src="/home/face-card.png"
          alt=""
          width={129}
          height={240}
          decoding="async"
        />
      </span>
      <p className={styles.name}>{name}</p>
      <p className={styles.line}>{line}</p>
      <p className={styles.place}>{place}</p>
      <div className={styles.links}>
        <a
          className={styles.link}
          href="https://www.linkedin.com/in/neilmcardle/"
          aria-label="LinkedIn"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              className={styles.solid}
              d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.6 4.77 6V21h-4v-5.03c0-1.2-.02-2.74-1.68-2.74-1.68 0-1.94 1.3-1.94 2.65V21h-4V9.75Z"
            />
          </svg>
        </a>
        <a
          className={styles.link}
          href="https://x.com/BetterNeil"
          aria-label="X"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              className={styles.solid}
              d="M17.75 3h3.07l-6.7 7.62L22 21h-6.17l-4.83-6.3L5.47 21H2.4l7.17-8.15L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.73H5.58l11.09 14.44Z"
            />
          </svg>
        </a>
        <button
          type="button"
          className={styles.link}
          onClick={copy}
          aria-label={copied ? "Email copied" : "Copy email"}
        >
          {copied ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
              <path d="M3.8 7.2 12 13l8.2-5.8" />
            </svg>
          )}
        </button>
        <span className={styles.status} aria-live="polite">
          {copied ? "Email copied" : ""}
        </span>
      </div>
    </div>
  );
}
