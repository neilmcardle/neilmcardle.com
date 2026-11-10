"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Piece } from "./data";
import styles from "./home.module.css";

export default function Rows({
  pieces,
  base = "",
}: {
  pieces: Piece[];
  base?: string;
}) {
  const peek = useRef<HTMLImageElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [src, setSrc] = useState<string>();
  const [on, setOn] = useState(false);

  const show = (row: HTMLElement, image?: string) => {
    const img = peek.current;
    const box = list.current?.getBoundingClientRect();
    if (
      !img ||
      !box ||
      !image ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      setOn(false);
      return;
    }
    const r = row.getBoundingClientRect();
    const w = img.offsetWidth || 280;
    const h = (w * 9) / 16;
    let x = box.right + 32;
    if (x + w > window.innerWidth - 16) x = box.right - w;
    const y = Math.min(
      Math.max(16, r.top + r.height / 2 - h / 2),
      window.innerHeight - h - 16,
    );
    img.style.translate = `${Math.round(x)}px ${Math.round(y)}px`;
    setSrc(image);
    setOn(true);
  };

  const hasLive = pieces.some((piece) => piece.live);

  return (
    <>
      <ul
        ref={list}
        className={styles.rows}
        onPointerLeave={() => setOn(false)}
      >
        {pieces.map((piece) => (
          <li key={piece.id} className={styles.rowItem}>
            <Link
              className={styles.row}
              href={piece.local ? `${base}${piece.href}` : piece.href}
              onPointerEnter={(e) => show(e.currentTarget, piece.image)}
              onFocus={() => setOn(false)}
            >
              <span className={styles.rowTitle}>{piece.title}</span>
              <span className={styles.rowLine}>{piece.line}</span>
              <span className={styles.rowKind}>{piece.kind}</span>
            </Link>
            {piece.live ? (
              <a
                className={styles.live}
                href={piece.live.href}
                aria-label={`${piece.live.label}, the live ${piece.title}`}
                {...(piece.live.href.startsWith("http")
                  ? { rel: "noopener" }
                  : {})}
              >
                {piece.live.label}
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
                </svg>
              </a>
            ) : hasLive ? (
              <span className={styles.live} aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ul>
      <img
        ref={peek}
        className={`${styles.peek} ${on ? styles.on : ""}`}
        src={src}
        alt=""
        aria-hidden="true"
      />
    </>
  );
}
