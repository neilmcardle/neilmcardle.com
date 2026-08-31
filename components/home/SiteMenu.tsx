"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

const PAGES: { label: string; href: string; external?: boolean }[] = [
  { label: "Selected work", href: "/#work" },
  { label: "Daily drawings", href: "/daily" },
  { label: "Archive", href: "/archive" },
  { label: "Paintings", href: "/paintings" },
];

const SOCIAL: { label: string; href: string; path: string }[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/neilmcardle/",
    path: "M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z",
  },
  {
    label: "GitHub",
    href: "https://github.com/neilmcardle",
    path: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
  },
  {
    label: "X",
    href: "https://x.com/BetterNeil",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
];

export default function SiteMenu() {
  const [open, setOpen] = useState(false);

  const [stamp, setStamp] = useState<{ year: number; day: number } | null>(
    null,
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    const now = new Date();
    const yearStart = Date.UTC(now.getFullYear(), 0, 1) / 86400000;
    const dayNumber =
      Math.floor(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000,
      ) -
      yearStart +
      1;
    setStamp({ year: now.getFullYear(), day: dayNumber });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open, close]);

  return (
    <div className={styles.menuWrap} ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.menuMark}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 78 78"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0,0v76.8c0,.5.4,1,1,1h37c.5,0,1-.4,1-1v-37.8L0,0Z" />
          <path d="M78,78V1.2c0-.5-.4-1-1-1h-37c-.5,0-1,.4-1,1v37.8l39,39Z" />
        </svg>
      </button>

      {open && (
        <div className={styles.menuPanel} role="menu">
          {PAGES.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              role="menuitem"
              className={styles.menuItem}
              onClick={() => setOpen(false)}
            >
              {p.label}
            </Link>
          ))}

          <div className={styles.menuRule} />

          <div className={styles.menuSocial}>
            {SOCIAL.map((sm) => (
              <a
                key={sm.label}
                href={sm.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={sm.label}
                className={styles.menuSocialLink}
                onClick={() => setOpen(false)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={sm.path} />
                </svg>
              </a>
            ))}
          </div>

          <div className={styles.menuRule} />

          <div className={styles.menuFine}>
            {stamp && (
              <span className={styles.menuYear}>
                {stamp.year} Day{" "}
                <span className={styles.menuDay}>{stamp.day}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
