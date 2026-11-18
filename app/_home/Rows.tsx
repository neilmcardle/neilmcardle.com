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

  return (
    <>
      <ul
        ref={list}
        className={styles.rows}
        onPointerLeave={() => setOn(false)}
      >
        {pieces.map((piece) => {
          const href = piece.local ? `${base}${piece.href}` : piece.href;
          const study = piece.href.startsWith("/work/");
          const outs = [
            ...(piece.live
              ? [
                  {
                    href: piece.live.href,
                    label: piece.live.label.replace(/^Open /, ""),
                    aria: `Open the live ${piece.title}`,
                  },
                ]
              : []),
            ...(piece.kindHref
              ? [
                  {
                    href: piece.kindHref,
                    label: piece.kindWhere ?? "App Store",
                    aria: `${piece.title} on ${piece.kindWhere ?? "the App Store"}`,
                  },
                ]
              : []),
          ];
          return (
            <li
              key={piece.id}
              className={styles.rowItem}
              onPointerEnter={(e) => show(e.currentTarget, piece.image)}
            >
              <Link
                className={styles.row}
                href={href}
                onFocus={() => setOn(false)}
              >
                <span className={styles.rowTitle}>{piece.title}</span>
                <span className={styles.rowLine}>{piece.line}</span>
                <span className={styles.rowKind}>{piece.kind}</span>
              </Link>
              {study || outs.length ? (
                <p className={styles.rowLinks}>
                  {study ? (
                    <Link
                      className={styles.live}
                      href={href}
                      aria-label={`${piece.title} case study`}
                    >
                      Case study
                      <svg
                        className={styles.rowArrow}
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                      >
                        <path d="M2.5 6h7M6.5 3l3 3-3 3" />
                      </svg>
                    </Link>
                  ) : null}
                  {outs.map((out) => (
                    <a
                      key={out.href}
                      className={styles.live}
                      href={out.href}
                      aria-label={out.aria}
                      {...(out.href.startsWith("http")
                        ? { rel: "noopener" }
                        : {})}
                    >
                      {out.label}
                      <svg viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
                      </svg>
                    </a>
                  ))}
                </p>
              ) : null}
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
      </span>
    </>
  );
}
