"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { media } from "@/lib/media";
import styles from "./heroFilm.module.css";

const SLIDE_MS = 7000;

const SLIDES = [
  {
    id: "podium",
    kind: "Game branding",
    title: "Podium",
    href: "/work/podium",
  },
  {
    id: "makeebook",
    kind: "Product",
    title: "makeEbook",
    href: "/work/makeebook",
  },
  {
    id: "coverly",
    kind: "Product",
    title: "Coverly",
    href: "/work/coverly",
  },
  {
    id: "avis",
    kind: "Case study",
    title: "Avis",
    href: "/work/avis",
  },
];

export default function HeroFilm() {
  const root = useRef<HTMLElement>(null);
  const films = useRef<(HTMLVideoElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);
  const [visible, setVisible] = useState(true);
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setStill(query.matches);
      if (query.matches) setPaused(true);
    };
    apply();
    query.addEventListener("change", apply);
    const seen = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (root.current) seen.observe(root.current);
    const hidden = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      query.removeEventListener("change", apply);
      seen.disconnect();
      document.removeEventListener("visibilitychange", hidden);
    };
  }, []);

  const running = !paused && visible;

  useEffect(() => {
    films.current.forEach((film, i) => {
      if (!film) return;
      if (i === index && running && !still) {
        film.play().catch(() => {});
      } else {
        film.pause();
      }
    });
  }, [index, running, still]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setMoved(true);
      setIndex((i) => (i + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [index, running]);

  const down = () => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const after = root.current?.nextElementSibling;
    if (after) after.scrollIntoView({ behavior: still ? "auto" : "smooth" });
  };

  const slide = SLIDES[index];
  const next = (index + 1) % SLIDES.length;

  return (
    <section
      ref={root}
      className={styles.hero}
      aria-roledescription="carousel"
      aria-label="Selected work"
    >
      <h1 className={styles.hidden}>
        Neil McArdle, Product Designer in London
      </h1>
      <div className={styles.films} aria-hidden="true">
        {SLIDES.map((s, i) => (
          <video
            key={s.id}
            ref={(el) => {
              films.current[i] = el;
            }}
            className={`${styles.film} ${i === index ? styles.on : ""}`}
            poster={`/home/hero/${s.id}.jpg`}
            src={
              (i === index || i === next) && !still
                ? media(`/home/${s.id}.mp4`)
                : undefined
            }
            muted
            loop
            playsInline
            preload={i === index ? "auto" : "metadata"}
          />
        ))}
      </div>
      <div className={styles.shade} />

      <div className={styles.foot}>
        <div
          className={styles.copy}
          key={slide.id}
          data-first={moved ? undefined : ""}
          aria-live="polite"
        >
          <p className={styles.kind}>{slide.kind}</p>
          <h2 className={styles.title}>{slide.title}</h2>
          <Link className={styles.discover} href={slide.href}>
            Discover
          </Link>
        </div>
        <button
          type="button"
          className={styles.down}
          aria-label="Scroll to the work"
          onClick={down}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 6l5 5 5-5" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        className={styles.pause}
        aria-label={paused ? "Play the films" : "Pause the films"}
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          {paused ? (
            <path className={styles.fill} d="M5 3.5v9l7.5-4.5z" />
          ) : (
            <path d="M5.5 3.5v9M10.5 3.5v9" />
          )}
        </svg>
      </button>
    </section>
  );
}
