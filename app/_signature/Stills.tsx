"use client";

import type React from "react";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./stills.module.css";

export type Still = { src: string; alt: string };

const SPRING =
  "linear(0, 0.0348, 0.121, 0.2357, 0.3618, 0.4874, 0.6045, 0.7082, 0.7962, 0.8681, 0.9246, 0.9671, 0.9975, 1.0179, 1.0303, 1.0366, 1.0384, 1.0371, 1.0338, 1.0294, 1.0246, 1.0197, 1.0152, 1.0112, 1.0079, 1.0051, 1.0029, 1.0013, 1.0001, 0.9993, 0.9988, 0.9986, 0.9985, 0.9986, 0.9987, 0.9989, 0.9991, 0.9992, 0.9994, 0.9996, 1)";
const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const SIZES = "(max-width: 720px) 50vw, 360px";

const still = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const between = (from: DOMRect, to: DOMRect) =>
  `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`;

export default function Stills({
  items,
  label,
}: {
  items: Still[];
  label: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const shot = useRef<HTMLDivElement>(null);
  const origin = useRef<{ rect: DOMRect; animate: boolean } | null>(null);
  const step = useRef<{ dir: number; animate: boolean } | null>(null);
  const busy = useRef(false);
  const swipe = useRef<number | null>(null);
  const scrub = useRef(false);

  const isOpen = index !== null;
  const last = items.length - 1;

  const open = (i: number, animate: boolean) => {
    const card = cards.current[i];
    if (!card || busy.current) return;
    origin.current = { rect: card.getBoundingClientRect(), animate };
    setIndex(i);
  };

  const go = (next: number, animate: boolean) => {
    if (index === null || next < 0 || next > last || next === index) return;
    step.current = { dir: Math.sign(next - index), animate };
    setIndex(next);
  };

  const close = async (animate: boolean) => {
    if (index === null || busy.current) return;
    const card = cards.current[index];
    const done = () => {
      busy.current = false;
      setIndex(null);
      card?.focus({ preventScroll: true });
    };
    if (!card || !stage.current || !animate || still()) return done();
    busy.current = true;
    card.scrollIntoView({ block: "nearest" });
    const to = card.getBoundingClientRect();
    const from = stage.current.getBoundingClientRect();
    const options = { duration: 380, easing: OUT, fill: "forwards" as const };
    await Promise.all([
      stage.current.animate(
        [{ transform: "none" }, { transform: between(to, from) }],
        options,
      ).finished,
      shade.current?.animate([{ opacity: 1 }, { opacity: 0 }], options)
        .finished,
      chrome.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 120,
        fill: "forwards",
      }).finished,
    ]);
    done();
  };

  useLayoutEffect(() => {
    const from = origin.current;
    if (!from || !stage.current) return;
    origin.current = null;
    if (!from.animate || still()) {
      if (from.animate)
        dialog.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 160,
          easing: OUT,
        });
      return;
    }
    const to = stage.current.getBoundingClientRect();
    stage.current.animate(
      [{ transform: between(from.rect, to) }, { transform: "none" }],
      { duration: 560, easing: SPRING },
    );
    shade.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 240,
      easing: OUT,
    });
    chrome.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 240,
      delay: 200,
      easing: OUT,
      fill: "backwards",
    });
  }, [isOpen]);

  useLayoutEffect(() => {
    const move = step.current;
    if (!move || !shot.current) return;
    step.current = null;
    if (!move.animate || still()) return;
    shot.current.animate(
      [
        { transform: `translateX(${move.dir * 32}px)`, opacity: 0 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 280, easing: OUT },
    );
  }, [index]);

  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLElement>("[data-first]")?.focus();
    return () => {
      root.style.overflow = before;
    };
  }, [isOpen]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close(false);
    if (e.key === "ArrowRight") return go((index ?? 0) + 1, false);
    if (e.key === "ArrowLeft") return go((index ?? 0) - 1, false);
    if (e.key !== "Tab" || !dialog.current) return;
    const stops = [
      ...dialog.current.querySelectorAll<HTMLElement>("button:not([disabled])"),
    ];
    const first = stops[0];
    const end = stops[stops.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      end.focus();
    } else if (!e.shiftKey && document.activeElement === end) {
      e.preventDefault();
      first.focus();
    }
  };

  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const at = Math.round(((e.clientX - r.left) / r.width) * last);
    go(Math.min(last, Math.max(0, at)), true);
  };

  const current = index === null ? null : items[index];

  return (
    <>
      <ul className={styles.grid} aria-label={label}>
        {items.map((item, i) => (
          <li key={item.src}>
            <button
              ref={(el) => {
                cards.current[i] = el;
              }}
              type="button"
              className={styles.card}
              style={{ opacity: index === i ? 0 : undefined }}
              onClick={(e) => open(i, e.detail !== 0)}
              aria-label={`Open still ${i + 1} of ${items.length}: ${item.alt}`}
            >
              <Image src={item.src} alt="" fill sizes={SIZES} />
            </button>
          </li>
        ))}
      </ul>

      {current && index !== null ? (
        <div
          ref={dialog}
          className={styles.viewer}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onKeyDown={onKey}
        >
          <div ref={shade} className={styles.shade} />
          <div
            className={styles.middle}
            onPointerDown={(e) => {
              if (e.pointerType !== "mouse") swipe.current = e.clientX;
            }}
            onPointerUp={(e) => {
              if (swipe.current === null) return;
              const dx = e.clientX - swipe.current;
              swipe.current = null;
              if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1), true);
            }}
          >
            <div ref={stage} className={styles.stage}>
              <div ref={shot} className={styles.shot}>
                <Image
                  src={current.src}
                  alt=""
                  fill
                  sizes={SIZES}
                  loading="eager"
                />
                <Image
                  key={current.src}
                  className={styles.sharp}
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="(max-width: 1200px) 92vw, 1120px"
                  priority
                  onLoad={(e) => e.currentTarget.setAttribute("data-on", "")}
                />
              </div>
            </div>
          </div>

          <div ref={chrome} className={styles.chrome}>
            <button
              type="button"
              className={`${styles.icon} ${styles.back}`}
              onClick={(e) => close(e.detail !== 0)}
              aria-label="Back to the stills"
              data-first
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M16 10H4M9 5l-5 5 5 5" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.icon} ${styles.all}`}
              onClick={(e) => close(e.detail !== 0)}
              aria-label="Show all stills"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <rect x="4" y="4" width="5" height="5" rx="1" />
                <rect x="11" y="4" width="5" height="5" rx="1" />
                <rect x="4" y="11" width="5" height="5" rx="1" />
                <rect x="11" y="11" width="5" height="5" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.round} ${styles.prev}`}
              onClick={(e) => go(index - 1, e.detail !== 0)}
              disabled={index === 0}
              aria-label="Previous still"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M12 5l-5 5 5 5" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.round} ${styles.next}`}
              onClick={(e) => go(index + 1, e.detail !== 0)}
              disabled={index === last}
              aria-label="Next still"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M8 5l5 5-5 5" />
              </svg>
            </button>

            <div className={styles.foot}>
              <p className={styles.caption} aria-live="polite">
                {current.alt}
              </p>
              <div
                className={styles.track}
                role="slider"
                tabIndex={-1}
                aria-label="Still"
                aria-valuemin={1}
                aria-valuemax={items.length}
                aria-valuenow={index + 1}
                onPointerDown={(e) => {
                  scrub.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  seek(e);
                }}
                onPointerMove={(e) => {
                  if (scrub.current) seek(e);
                }}
                onPointerUp={() => {
                  scrub.current = false;
                }}
              >
                {items.map((item) => (
                  <span key={item.src} className={styles.tick} />
                ))}
                <span
                  className={styles.rail}
                  style={{ transform: `translateX(${(index / last) * 100}%)` }}
                >
                  <span className={styles.knob} />
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
