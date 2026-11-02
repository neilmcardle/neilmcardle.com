"use client";

import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import type { Work } from "./data/data";
import styles from "./index.module.css";

const GAP = 24;
const EDGE = 16;

export default function HoverRows({ works }: { works: Work[] }) {
  const card = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<Work>();
  const [on, setOn] = useState(false);
  const [warm, setWarm] = useState(false);

  const show = (row: HTMLAnchorElement, work: Work) => {
    const el = card.current;
    if (
      !el ||
      !work.preview ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    const r = row.getBoundingClientRect();
    const right = Math.max(
      ...[...row.children].map((child) => {
        const range = document.createRange();
        range.selectNodeContents(child);
        return range.getBoundingClientRect().right;
      }),
    );
    const w = el.offsetWidth || 240;
    const h = el.offsetHeight || 135;
    let x = right + GAP;
    if (x + w > window.innerWidth - EDGE) x = r.left - w - GAP;
    if (x < EDGE) x = Math.min(right + GAP, window.innerWidth - w - EDGE);
    const y = Math.min(
      Math.max(EDGE, r.top + r.height / 2 - h / 2),
      window.innerHeight - h - EDGE,
    );
    el.style.translate = `${Math.round(x)}px ${Math.round(y)}px`;
    setShown(work);
    setOn(true);
  };

  return (
    <>
      <div className={styles.rows} onPointerEnter={() => setWarm(true)}>
        {works.map((work) => {
          const body = (
            <>
              <span className={styles.name}>{work.title}</span>
              <span className={styles.line}>{work.pills.join(", ")}</span>
            </>
          );
          const events = {
            onPointerEnter: (e: PointerEvent<HTMLAnchorElement>) =>
              show(e.currentTarget, work),
            onPointerLeave: () => setOn(false),
          };
          return work.href.startsWith("http") ? (
            <a
              key={work.title}
              className={styles.row}
              href={work.href}
              rel="noopener"
              {...events}
            >
              {body}
            </a>
          ) : (
            <Link
              key={work.title}
              className={styles.row}
              href={work.href}
              {...events}
            >
              {body}
            </Link>
          );
        })}
      </div>
      <div
        ref={card}
        className={`${styles.card} ${on ? styles.on : ""}`}
        aria-hidden="true"
      >
        {works.map((work) =>
          warm && work.preview ? (
            <img
              key={work.title}
              src={work.preview}
              alt=""
              decoding="async"
              hidden={shown?.title !== work.title}
            />
          ) : null,
        )}
      </div>
    </>
  );
}
