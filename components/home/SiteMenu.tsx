"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { MarkEdge, MarkPlate } from "./ProductBadge";
import { motionEnabled } from "./motion";
import {
  currentTheme,
  setTheme,
  subscribeTheme,
  type SiteTheme,
} from "./theme";
import styles from "./home.module.css";

const PAGES: { label: string; href: string; external?: boolean }[] = [
  { label: "Work", href: "/#work" },
  { label: "Paintings", href: "/paintings" },
  { label: "Archive", href: "/archive" },
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

const isDark = () => currentTheme() === "dark";

function switchTheme(next: SiteTheme, origin: HTMLElement) {
  const still =
    !motionEnabled() ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still || !("startViewTransition" in document)) {
    setTheme(next);
    return;
  }
  const box = origin.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  const root = document.documentElement;
  root.classList.add("theme-reveal");
  const transition = document.startViewTransition(() => setTheme(next));
  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 380,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => undefined);
  transition.finished.finally(() => root.classList.remove("theme-reveal"));
}

export default function SiteMenu({
  themeToggle = false,
}: {
  themeToggle?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const [stamp, setStamp] = useState<{ year: number; day: number } | null>(
    null,
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const switchRef = useRef<HTMLSpanElement>(null);
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => true);

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
          width="40"
          height="40"
          viewBox="0 0 63 63"
          fill="none"
          aria-hidden="true"
        >
          <MarkPlate id="nmark" />
          <g className={styles.markGlyph} filter="url(#nmark-shadow-a)">
            <path d="M45 45L32 31.2985V18H45V45Z" fill="#FEFEFE" />
            <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" fill="#FEFEFE" />
          </g>
          <g className={styles.markGlyph} filter="url(#nmark-shadow-b)">
            <path d="M45 45L32 31.2985V18H45V45Z" fill="#FEFEFE" />
            <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" fill="#FEFEFE" />
          </g>
          <defs>
            <filter
              id="nmark-shadow-a"
              x="17"
              y="18"
              width="29"
              height="29"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="bg" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="0.5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
              />
              <feBlend mode="normal" in2="bg" result="shadowA" />
              <feBlend mode="normal" in="SourceGraphic" in2="shadowA" />
            </filter>
            <filter
              id="nmark-shadow-b"
              x="14"
              y="16"
              width="35"
              height="35"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="bg" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="2" />
              <feGaussianBlur stdDeviation="2" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
              />
              <feBlend mode="normal" in2="bg" result="shadowB" />
              <feBlend mode="normal" in="SourceGraphic" in2="shadowB" />
            </filter>
            <MarkEdge id="nmark" />
          </defs>
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

          {themeToggle && (
            <>
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={dark}
                className={styles.menuItem}
                onClick={() => {
                  if (switchRef.current)
                    switchTheme(dark ? "light" : "dark", switchRef.current);
                }}
              >
                Dark mode
                <span
                  ref={switchRef}
                  className={styles.themeSwitch}
                  data-dark={dark}
                  aria-hidden="true"
                >
                  <span className={styles.themeKnob} />
                  <span className={`${styles.themeIcon} ${styles.themeSun}`}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="4.2" />
                      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
                    </svg>
                  </span>
                  <span className={`${styles.themeIcon} ${styles.themeMoon}`}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.3 14.7A8.5 8.5 0 0 1 9.3 3.7a8.5 8.5 0 1 0 11 11Z" />
                    </svg>
                  </span>
                </span>
              </button>

              <div className={styles.menuRule} />
            </>
          )}

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

          <div className={styles.menuRule} />

          <div className={styles.menuFine}>
            <span className={styles.menuCopy}>&copy; 2026 Neil McArdle</span>
            <Link
              href="/privacy"
              role="menuitem"
              className={styles.menuFineLink}
              onClick={() => setOpen(false)}
            >
              Privacy
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
