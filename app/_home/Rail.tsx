"use client";

import { useEffect, useRef, useState } from "react";
import { createSample } from "@/lib/coverly/sfx";
import { WRITING_PUBLIC } from "./data";
import styles from "./home.module.css";

const tick = createSample("/coverly/tick-pop.mp3", () => true, {
  gap: 120,
  live: true,
});

const ITEMS = [
  { id: "about", label: "Neil" },
  { id: "work", label: "Work" },
  ...(WRITING_PUBLIC ? [{ id: "writing", label: "Writing" }] : []),
  { id: "moments", label: "Moments" },
  { id: "interactions", label: "Interactions" },
  { id: "play", label: "Playground" },
  { id: "contact", label: "Contact" },
];

export default function Rail() {
  const [current, setCurrent] = useState("about");
  const lock = useRef(0);

  useEffect(() => {
    tick.prime();
    const unlock = () => tick.unlock();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    const seen = new Map<string, number>();
    const atEnd = () =>
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 24;
    const pick = () => {
      if (Date.now() <= lock.current) return;
      if (atEnd()) {
        setCurrent(ITEMS[ITEMS.length - 1].id);
        return;
      }
      const top = ITEMS.map((item) => item.id).find(
        (id) => (seen.get(id) ?? 0) > 0,
      );
      if (top) setCurrent(top);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          seen.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        pick();
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.01] },
    );
    const onScroll = () => pick();
    for (const item of ITEMS) {
      const el = document.getElementById(item.id);
      if (el) io.observe(el);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <nav className={styles.rail} aria-label="Sections">
      {ITEMS.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={current === item.id ? styles.here : undefined}
          aria-current={current === item.id ? "true" : undefined}
          onClick={(event) => {
            const target = document.getElementById(item.id);
            if (!target) return;
            event.preventDefault();
            lock.current = Date.now() + 1200;
            const release = () => {
              lock.current = 0;
              window.removeEventListener("scrollend", release);
            };
            window.addEventListener("scrollend", release);
            if (item.id !== current) tick.play(0.18);
            setCurrent(item.id);
            const calm = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;
            target.scrollIntoView({ behavior: calm ? "auto" : "smooth" });
            history.replaceState(null, "", `#${item.id}`);
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
