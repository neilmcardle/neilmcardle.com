"use client";

import { media } from "@/lib/media";
import { useEffect, useRef, useState } from "react";
import AutoVideo from "@/app/_home/AutoVideo";
import styles from "./column.module.css";

export default function HeroFilm() {
  const ref = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [still, setStill] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const video = ref.current?.querySelector("video");
    if (!video) return;
    const sync = () => setPlaying(!video.paused);
    sync();
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    return () => {
      video.removeEventListener("play", sync);
      video.removeEventListener("pause", sync);
    };
  }, []);

  const pause = () => {
    const video = ref.current?.querySelector("video");
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const toggle = () => {
    const video = ref.current?.querySelector("video");
    if (!video) return;
    video.muted = !muted;
    if (video.paused) video.play().catch(() => {});
    setMuted(!muted);
  };

  const down = () => {
    const target = document.querySelector('[data-group="work"]');
    if (!target) return;
    target.scrollIntoView({
      block: "start",
      behavior: still ? "instant" : "smooth",
    });
  };

  return (
    <section className={styles.hero} data-hero aria-label="Showreel">
      <div ref={ref} className={styles.heroFrame}>
        <AutoVideo
          className={styles.heroFilm}
          poster="/home/hero-film-v10.jpg"
          aria-label="Showreel: an N made of particles splits into rounded squares, then zooms through six pieces of work, from the Avis checkout to Chess Path, and back into the N"
          autoPlay={!still}
          controls={still}
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source
            media="(max-width: 599px)"
            src={media("/home/hero-film-v10-square.mp4")}
            type="video/mp4"
          />
          <source src={media("/home/hero-film-v10.mp4")} type="video/mp4" />
        </AutoVideo>
        {still ? null : (
          <button
            type="button"
            className={`${styles.heroSound} ${styles.heroPause}`}
            aria-label={playing ? "Pause the showreel" : "Play the showreel"}
            onClick={pause}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {playing ? (
                <path d="M8 5.5h2.6v13H8zM13.4 5.5H16v13h-2.6z" />
              ) : (
                <path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.6-6.8a.8.8 0 0 0 0-1.4L9.2 4.5a.8.8 0 0 0-1.2.7z" />
              )}
            </svg>
          </button>
        )}
        {still ? null : (
          <button
            type="button"
            className={styles.heroSound}
            aria-pressed={!muted}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            onClick={toggle}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
              {muted ? (
                <path d="M16 9.5l5 5M21 9.5l-5 5" />
              ) : (
                <path d="M16 9a4.2 4.2 0 0 1 0 6M18.6 6.5a7.8 7.8 0 0 1 0 11" />
              )}
            </svg>
          </button>
        )}
      </div>
      <button
        type="button"
        className={styles.heroDown}
        aria-label="Scroll to the work"
        onClick={down}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9.5l6 6 6-6" />
        </svg>
      </button>
    </section>
  );
}
