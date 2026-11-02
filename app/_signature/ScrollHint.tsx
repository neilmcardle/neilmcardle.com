"use client";

import { useEffect, useState } from "react";
import styles from "./scrollHint.module.css";

export default function ScrollHint({ target }: { target: string }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const check = () => setGone(window.scrollY > 40);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <a
      href={`#${target}`}
      className={`${styles.hint} ${gone ? styles.gone : ""}`}
      tabIndex={gone ? -1 : undefined}
      aria-hidden={gone || undefined}
      onClick={(event) => {
        event.preventDefault();
        const still = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        document
          .getElementById(target)
          ?.scrollIntoView({ behavior: still ? "auto" : "smooth" });
      }}
    >
      Scroll
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path d="M3 4.5 6 7.5 9 4.5" />
      </svg>
    </a>
  );
}
