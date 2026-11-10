"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./article.module.css";

export type Section = { id: string; label: string };

export default function Contents({ sections }: { sections: Section[] }) {
  const [current, setCurrent] = useState(sections[0]?.id);
  const lock = useRef(0);
  const release = useRef<(() => void) | null>(null);

  const unlock = () => {
    lock.current = 0;
    if (release.current)
      window.removeEventListener("scrollend", release.current);
    release.current = null;
  };

  useEffect(
    () => () => {
      if (release.current)
        window.removeEventListener("scrollend", release.current);
      release.current = null;
    },
    [],
  );

  useEffect(() => {
    const pick = () => {
      if (Date.now() <= lock.current) return;
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 24;
      if (atEnd) {
        setCurrent(sections[sections.length - 1]?.id);
        return;
      }
      const passed = sections.filter((s) => {
        const el = document.getElementById(s.id);
        return el && el.getBoundingClientRect().top < window.innerHeight * 0.4;
      });
      setCurrent((passed.at(-1) ?? sections[0])?.id);
    };
    const io = new IntersectionObserver(() => pick(), {
      rootMargin: "-35% 0px -55% 0px",
    });
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    window.addEventListener("scroll", pick, { passive: true });
    pick();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", pick);
    };
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav className={styles.contents} aria-label="On this page">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={current === s.id ? styles.here : undefined}
          aria-current={current === s.id ? "true" : undefined}
          onClick={(event) => {
            const target = document.getElementById(s.id);
            if (!target) return;
            event.preventDefault();
            unlock();
            lock.current = Date.now() + 1200;
            const done = () => unlock();
            release.current = done;
            window.addEventListener("scrollend", done);
            setCurrent(s.id);
            const calm = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;
            target.scrollIntoView({ behavior: calm ? "auto" : "smooth" });
            history.replaceState(null, "", `#${s.id}`);
          }}
        >
          <span className={styles.label}>{s.label}</span>
        </a>
      ))}
    </nav>
  );
}
