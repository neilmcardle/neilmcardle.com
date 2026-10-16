"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./orbit.module.css";

const AVIS = "https://www.avisbudgetgroup.com/home/our-brands";

type Quote = {
  price: number;
  change: number;
  percent: number;
  points: number[];
};

function canHover() {
  return window.matchMedia("(hover: hover) and (min-width: 900px)").matches;
}

function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const path = points
    .map((value, i) => {
      const x = (i / (points.length - 1)) * 64;
      const y = 18 - ((value - min) / span) * 16;
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      className={styles.spark}
      data-down={up ? undefined : true}
      viewBox="0 0 64 20"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export default function AvisLink({ copy = false }: { copy?: boolean }) {
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const timer = useRef(0);
  const asked = useRef(false);

  if (copy) {
    return (
      <a
        className={styles.roleLink}
        href={AVIS}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
      >
        Avis Budget Group
      </a>
    );
  }

  const show = () => {
    if (!canHover()) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), 250);
    if (asked.current) return;
    asked.current = true;
    fetch("/api/stock/car")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data && Number.isFinite(data.price)) setQuote(data);
      })
      .catch(() => {});
  };

  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 150);
  };

  const up = (quote?.change ?? 0) >= 0;

  return (
    <span
      className={styles.avis}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <a
        className={styles.roleLink}
        href={AVIS}
        target="_blank"
        rel="noopener noreferrer"
      >
        Avis Budget Group
      </a>
      <span
        className={styles.avisCard}
        data-open={open || undefined}
        aria-hidden="true"
      >
        <span className={styles.avisTop}>
          <img
            className={styles.avisLogo}
            src="/logos/avis-budget-group.svg"
            alt=""
          />
          <a
            className={styles.avisVisit}
            href={AVIS}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
          >
            Visit site
          </a>
        </span>
        <span className={styles.avisQuote}>
          <span className={styles.avisTicker}>NASDAQ: CAR</span>
          {quote ? (
            <>
              <span className={styles.avisPrice}>
                ${quote.price.toFixed(2)}
              </span>
              <span
                className={styles.avisChange}
                data-down={up ? undefined : true}
              >
                {up ? "▲" : "▼"} {Math.abs(quote.percent).toFixed(2)}%
              </span>
              <Sparkline points={quote.points ?? []} up={up} />
            </>
          ) : null}
        </span>
        <span className={styles.avisBio}>
          Global mobility, operating Avis, Budget and Zipcar.
        </span>
        <span className={styles.avisBrands}>
          <strong>14 brands</strong> including Payless, Maggiore and France Cars
        </span>
        <span className={styles.avisMe}>
          <span className={styles.avisFace}>
            <Image
              src="/hero/portrait.png"
              alt=""
              width={480}
              height={480}
              sizes="20px"
            />
          </span>
          Neil, Senior Digital Product Designer, London
        </span>
      </span>
    </span>
  );
}
