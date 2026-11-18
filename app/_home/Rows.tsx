"use client";

import Image from "next/image";
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
  const peek = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [src, setSrc] = useState<string>();
  const [on, setOn] = useState(false);
  const [verb, setVerb] = useState<string>();

  const show = (row: HTMLElement, image?: string, action?: string) => {
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
    setVerb(action);
    setOn(true);
  };

  return (
    <>
      <ul
        ref={list}
        className={styles.rows}
        onPointerLeave={() => setOn(false)}
      >
        {pieces.map((piece) => {
          const href = piece.local ? `${base}${piece.href}` : piece.href;
          return (
            <li
              key={piece.id}
              className={styles.rowItem}
              onPointerEnter={(e) =>
                show(e.currentTarget, piece.image, piece.verb)
              }
            >
              <Link
                className={styles.row}
                href={href}
                onFocus={() => setOn(false)}
              >
                <span className={styles.rowTitle}>{piece.title}</span>
                <span className={styles.rowLine}>{piece.line}</span>
              </Link>
              {piece.live && (
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
              )}
              <Link
                className={styles.rowRest}
                href={href}
                tabIndex={-1}
                aria-hidden="true"
              >
                {!piece.kindHref && (
                  <span className={styles.rowKind}>{piece.kind}</span>
                )}
              </Link>
              {piece.kindHref && (
                <a
                  className={styles.kindLink}
                  href={piece.kindHref}
                  rel="noopener"
                  aria-label={`${piece.title} on ${piece.kindWhere ?? "the App Store"}`}
                  onPointerEnter={() =>
                    setVerb(
                      piece.kindWhere === "GitHub"
                        ? "View on GitHub"
                        : "Open in the App Store",
                    )
                  }
                  onPointerLeave={() => setVerb(piece.verb)}
                >
                  <span className={styles.rowKind}>{piece.kind}</span>
                  <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
                  </svg>
                </a>
              )}
            </li>
          );
        })}
      </ul>
      <span
        ref={peek}
        className={`${styles.peek} ${on ? styles.on : ""}`}
        aria-hidden="true"
      >
        {src ? <Image src={src} alt="" fill sizes="280px" /> : null}
        {verb ? <span className={styles.chipOpen}>{verb}</span> : null}
      </span>
    </>
  );
}
