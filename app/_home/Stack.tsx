"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { media } from "@/lib/media";
import Brand from "./Brand";
import { STACK } from "./data";
import styles from "./home.module.css";

const LAST = STACK.length - 1;
const MID = LAST / 2;
const STIFFNESS = (2 * Math.PI) / 0.48;
const DAMPING = 0.8;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const place = (d: number, spread: number, lift: number) => {
  const a = Math.abs(d);
  const x = d * mix(62, 118, spread);
  const y = a * mix(10, 6, spread) - 16 * lift;
  const r = d * mix(6, 3, spread);
  const s = 1 - a * mix(0.07, 0.04, spread) + 0.05 * lift;
  return `translate(calc(-50% + ${x}px), ${y}px) rotate(${r}deg) scale(${s})`;
};

type Spring = { value: number; velocity: number; target: number };

const spring = (value: number): Spring => ({
  value,
  velocity: 0,
  target: value,
});

const step = (s: Spring, dt: number) => {
  const k = STIFFNESS * STIFFNESS;
  const c = 2 * DAMPING * STIFFNESS;
  s.velocity += (-k * (s.value - s.target) - c * s.velocity) * dt;
  s.value += s.velocity * dt;
  const done =
    Math.abs(s.value - s.target) < 0.001 && Math.abs(s.velocity) < 0.01;
  if (done) {
    s.value = s.target;
    s.velocity = 0;
  }
  return done;
};

const resist = (value: number) => {
  if (value < 0) return value * 0.35;
  if (value > LAST) return LAST + (value - LAST) * 0.35;
  return value;
};

export default function Stack({ base = "" }: { base?: string }) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [films, setFilms] = useState(false);
  const [manual, setManual] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const touch = useRef(false);
  const self = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const motion = useRef({
    pos: spring(MID),
    spread: spring(0),
    lift: spring(0),
    frame: 0,
    last: 0,
    calm: false,
  });
  const swipe = useRef<{
    x: number;
    y: number;
    from: number;
    step: number;
    moved: boolean;
    samples: { t: number; x: number }[];
  } | null>(null);
  const swiped = useRef(false);

  const paint = () => {
    const { pos, spread, lift } = motion.current;
    cards.current.forEach((card, i) => {
      if (!card) return;
      const d = i - pos.value;
      const near = Math.max(0, 1 - Math.abs(d));
      card.style.transform = place(d, spread.value, lift.value * near);
      card.style.zIndex = String(Math.round(20 - Math.abs(d) * 2));
    });
  };

  const run = () => {
    const m = motion.current;
    if (m.frame) return;
    m.last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - m.last) / 1000);
      m.last = now;
      const settled = [
        m.spread,
        m.lift,
        ...(swipe.current?.moved ? [] : [m.pos]),
      ]
        .map((s) => step(s, dt))
        .every(Boolean);
      paint();
      m.frame =
        settled && !swipe.current?.moved ? 0 : requestAnimationFrame(tick);
    };
    m.frame = requestAnimationFrame(tick);
  };

  const go = (to: { pos?: number; spread?: number; lift?: number }) => {
    const m = motion.current;
    if (to.pos !== undefined) m.pos.target = to.pos;
    if (to.spread !== undefined) m.spread.target = to.spread;
    if (to.lift !== undefined) m.lift.target = to.lift;
    if (m.calm) {
      for (const s of [m.pos, m.spread, m.lift]) {
        s.value = s.target;
        s.velocity = 0;
      }
      paint();
      return;
    }
    run();
  };

  const land = (i: number) => {
    setActive(STACK[i].id);
    go({ pos: i, spread: 1, lift: 1 });
  };

  useEffect(() => {
    if (!active) return;
    const close = (event: PointerEvent) => {
      if (self.current?.contains(event.target as Node)) return;
      setOpen(false);
      setActive(null);
      if (manual) go({ spread: 0, lift: 0 });
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  });

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
    const coarse = window.matchMedia("(hover: none)").matches;
    motion.current.calm = calm;
    setManual(coarse);
    setFilms(
      !calm && window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    );
    if (calm) {
      setReady(true);
      return;
    }
    const id = window.setTimeout(() => setReady(true), 80);
    const m = motion.current;
    return () => {
      window.clearTimeout(id);
      cancelAnimationFrame(m.frame);
      m.frame = 0;
    };
  }, []);

  useEffect(() => {
    if (manual && ready) paint();
  }, [manual, ready]);

  const current = STACK.find((piece) => piece.id === active);

  return (
    <div className={styles.stackWrap}>
      <div
        ref={self}
        className={[
          styles.stack,
          ready ? styles.ready : "",
          manual ? styles.manual : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setOpen(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          setOpen(false);
          setActive(null);
        }}
        onPointerDown={(event) => {
          if (!manual || event.pointerType === "mouse") return;
          const stage = self.current;
          const scale = stage
            ? stage.getBoundingClientRect().width / stage.offsetWidth
            : 1;
          const m = motion.current;
          m.pos.velocity = 0;
          swipe.current = {
            x: event.clientX,
            y: event.clientY,
            from: m.pos.value,
            step: 118 * scale,
            moved: false,
            samples: [{ t: event.timeStamp, x: event.clientX }],
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
            gesture.x = event.clientX;
            gesture.from = motion.current.pos.value;
            setOpen(true);
            go({ spread: 1 });
          }
          gesture.samples.push({ t: event.timeStamp, x: event.clientX });
          if (gesture.samples.length > 5) gesture.samples.shift();
          const m = motion.current;
          m.pos.value = resist(
            gesture.from - (event.clientX - gesture.x) / gesture.step,
          );
          m.pos.target = m.pos.value;
          run();
        }}
        onPointerUp={() => {
          const gesture = swipe.current;
          swipe.current = null;
          if (!gesture?.moved) return;
          swiped.current = true;
          const first = gesture.samples[0];
          const last = gesture.samples[gesture.samples.length - 1];
          const ms = Math.max(1, last.t - first.t);
          const velocity = -((last.x - first.x) / ms) * (1000 / gesture.step);
          const m = motion.current;
          m.pos.velocity = velocity;
          const throwTo = m.pos.value + velocity * 0.1;
          const nearest = Math.round(gesture.from);
          const i = Math.max(
            0,
            Math.min(
              LAST,
              Math.max(nearest - 2, Math.min(nearest + 2, Math.round(throwTo))),
            ),
          );
          land(i);
        }}
        onPointerCancel={() => {
          const gesture = swipe.current;
          swipe.current = null;
          if (!gesture?.moved) return;
          land(
            Math.max(0, Math.min(LAST, Math.round(motion.current.pos.value))),
          );
        }}
      >
        {STACK.map((piece, i) => {
          const d = i - MID;
          const lifted = active === piece.id;
          return (
            <Link
              key={piece.id}
              ref={(node) => {
                cards.current[i] = node;
              }}
              href={`${base}${piece.href}`}
              className={styles.card}
              style={
                manual
                  ? undefined
                  : {
                      transform: ready
                        ? place(d, open ? 1 : 0, lifted ? 1 : 0)
                        : "translate(-50%, 24px) scale(0.9)",
                      zIndex: lifted ? 20 : 10 - Math.abs(d),
                      transitionDelay:
                        ready && !open ? `${Math.abs(d) * 40}ms` : "0ms",
                    }
              }
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
                setOpen(true);
                if (manual) land(i);
                else setActive(piece.id);
              }}
              onFocus={() => {
                if (touch.current) return;
                setOpen(true);
                setActive(piece.id);
                if (manual) go({ pos: i, spread: 1, lift: 1 });
              }}
              onBlur={() => {
                if (touch.current) return;
                setOpen(false);
                setActive(null);
                if (manual) go({ spread: 0, lift: 0 });
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
