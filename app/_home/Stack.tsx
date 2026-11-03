"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const touch = useRef(false);
  const self = useRef<HTMLDivElement>(null);
  const mid = (STACK.length - 1) / 2;
  const [centre, setCentre] = useState(mid);
  const [dragging, setDragging] = useState(false);
  const swipe = useRef<{
    x: number;
    y: number;
    from: number;
    step: number;
    moved: boolean;
  } | null>(null);
  const swiped = useRef(false);

  const pick = (i: number) => {
    setCentre(i);
    setOpen(true);
    setActive(STACK[i].id);
  };

  useEffect(() => {
    if (!active) return;
    const close = (event: PointerEvent) => {
      if (self.current?.contains(event.target as Node)) return;
      setOpen(false);
      setActive(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [active]);

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

  return (
    <div className={styles.stackWrap}>
      <div
        ref={self}
        className={`${styles.stack} ${ready ? styles.ready : ""}`}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setOpen(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          setOpen(false);
          setActive(null);
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse") return;
          const stage = self.current;
          const scale = stage
            ? stage.getBoundingClientRect().width / stage.offsetWidth
            : 1;
          swipe.current = {
            x: event.clientX,
            y: event.clientY,
            from: centre,
            step: 118 * scale,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const gesture = swipe.current;
          if (!gesture) return;
          const dx = event.clientX - gesture.x;
          const dy = event.clientY - gesture.y;
          if (!gesture.moved) {
            if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
            gesture.moved = true;
            setDragging(true);
            setOpen(true);
          }
          const next = gesture.from - dx / gesture.step;
          setCentre(Math.max(-0.3, Math.min(STACK.length - 0.7, next)));
        }}
        onPointerUp={() => {
          const gesture = swipe.current;
          swipe.current = null;
          if (!gesture?.moved) return;
          swiped.current = true;
          setDragging(false);
          setCentre((value) => {
            const i = Math.max(
              0,
              Math.min(STACK.length - 1, Math.round(value)),
            );
            setActive(STACK[i].id);
            return i;
          });
        }}
        onPointerCancel={() => {
          swipe.current = null;
          setDragging(false);
          setCentre((value) =>
            Math.max(0, Math.min(STACK.length - 1, Math.round(value))),
          );
        }}
      >
        {STACK.map((piece, i) => {
          const d = i - (touch.current ? centre : mid);
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
                transitionDuration: dragging ? "0s" : undefined,
              }}
              onPointerDown={(event) => {
                touch.current = event.pointerType !== "mouse";
              }}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setActive(piece.id);
              }}
              onClick={(event) => {
                if (swiped.current) {
                  swiped.current = false;
                  event.preventDefault();
                  return;
                }
                if (!touch.current || active === piece.id) return;
                event.preventDefault();
                pick(i);
              }}
              onFocus={() => {
                if (touch.current) return;
                setOpen(true);
                setActive(piece.id);
              }}
              onBlur={() => {
                if (touch.current) return;
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
