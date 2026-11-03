"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { media } from "@/lib/media";
import Brand from "./Brand";
import { STACK } from "./data";
import styles from "./home.module.css";

const place = (d: number, open: boolean, lifted: boolean) => {
  const a = Math.abs(d);
  const x = d * (open ? 118 : 62);
  const y = a * (open ? 6 : 10) - (lifted ? 16 : 0);
  const r = d * (open ? 3 : 6);
  const s = 1 - a * (open ? 0.04 : 0.07) + (lifted ? 0.05 : 0);
  return `translate(calc(-50% + ${x}px), ${y}px) rotate(${r}deg) scale(${s})`;
};

export default function Stack({ base = "" }: { base?: string }) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [films, setFilms] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    if (!active || !films) return;
    const id = window.setTimeout(() => setPlaying(active), 900);
    return () => {
      window.clearTimeout(id);
      setPlaying(null);
    };
  }, [active, films]);

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setFilms(
      !calm && window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    );
    if (calm) {
      setReady(true);
      return;
    }
    const id = window.setTimeout(() => setReady(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  const current = STACK.find((piece) => piece.id === active);
  const mid = (STACK.length - 1) / 2;

  return (
    <div className={styles.stackWrap}>
      <div
        className={`${styles.stack} ${ready ? styles.ready : ""}`}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => {
          setOpen(false);
          setActive(null);
        }}
      >
        {STACK.map((piece, i) => {
          const d = i - mid;
          const lifted = active === piece.id;
          return (
            <Link
              key={piece.id}
              href={`${base}${piece.href}`}
              className={styles.card}
              style={{
                transform: ready
                  ? place(d, open, lifted)
                  : "translate(-50%, 24px) scale(0.9)",
                zIndex: lifted ? 20 : 10 - Math.abs(d),
                transitionDelay:
                  ready && !open ? `${Math.abs(d) * 40}ms` : "0ms",
              }}
              onPointerEnter={() => setActive(piece.id)}
              onFocus={() => {
                setOpen(true);
                setActive(piece.id);
              }}
              onBlur={() => {
                setOpen(false);
                setActive(null);
              }}
              aria-label={`${piece.title}, ${piece.kind}`}
            >
              <Brand id={piece.id} />
              {playing === piece.id && piece.film ? (
                <video
                  className={styles.cardFilm}
                  src={media(piece.film)}
                  muted
                  loop
                  autoPlay
                  playsInline
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          );
        })}
      </div>
      <p className={styles.caption} aria-hidden="true">
        {current ? (
          <>
            <span>{current.title}</span> {current.kind}
          </>
        ) : (
          "Selected work"
        )}
      </p>
    </div>
  );
}
