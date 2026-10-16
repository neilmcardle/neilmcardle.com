"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./column.module.css";

type Section = { key: string; label: string };

export default function SectionChips({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState<string | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const spy = () => {
      frame = 0;
      const line = 120;
      let current: string | null = sections[0]?.key ?? null;
      sections.forEach((section) => {
        const target = document.querySelector(`[data-group="${section.key}"]`);
        if (target && target.getBoundingClientRect().top <= line)
          current = section.key;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(spy);
    };
    spy();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.querySelector<HTMLElement>("[aria-current='true']");
    if (!row || !chip) return;
    row.scrollTo({
      left: chip.offsetLeft - row.clientWidth / 2 + chip.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

  const go = (key: string) => {
    const target = document.querySelector(`[data-group="${key}"]`);
    if (!target) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      block: "start",
      behavior: reduced ? "instant" : "smooth",
    });
  };

  return (
    <nav className={styles.chips} aria-label="Sections">
      <div ref={rowRef} className={styles.chipRow}>
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            className={styles.chip}
            aria-current={active === section.key ? "true" : undefined}
            onClick={() => go(section.key)}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
