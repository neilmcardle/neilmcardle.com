"use client";

import Link from "next/link";
import { useId, useRef, useState, type ReactNode } from "react";
import shell from "./signature.module.css";
import styles from "./playground.module.css";

const ROWS = [
  {
    title: "Chess Path",
    line: "Teach yourself chess",
    href: "/chess",
    preview: "/home/leads/chess-path.jpg",
  },
  {
    title: "Spark",
    line: "A course for designers learning to build",
    href: "/spark",
    preview: "/home/leads/spark.jpg",
  },
  {
    title: "Podium",
    line: "Branding for an indie game",
    href: "/work/podium",
    local: true,
    preview: "/home/leads/podium.jpg",
  },
  {
    title: "Everything else",
    line: "Explorations, tools, covers, paintings",
    href: "/work#play",
    local: true,
  },
];

export default function Playground({
  base = "",
  more,
}: {
  base?: string;
  more?: ReactNode;
}) {
  const panel = useId();
  const [open, setOpen] = useState(false);
  const peek = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState<string>();
  const [on, setOn] = useState(false);

  const show = (row: HTMLAnchorElement, preview?: string) => {
    const img = peek.current;
    if (
      !img ||
      !preview ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    const r = row.getBoundingClientRect();
    const right = Math.max(
      ...[...row.children].map((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().right;
      }),
    );
    const w = img.offsetWidth || 240;
    const h = (w * 9) / 16;
    let x = right + 24;
    if (x + w > window.innerWidth - 16) x = r.left - w - 24;
    const y = Math.min(
      Math.max(16, r.top + r.height / 2 - h / 2),
      window.innerHeight - h - 16,
    );
    img.style.translate = `${Math.round(x)}px ${Math.round(y)}px`;
    setSrc(preview);
    setOn(true);
  };

  return (
    <section className={`${shell.wrap} ${styles.section}`}>
      <h2 className={shell.label} id="play">
        Playground
      </h2>
      <div className={styles.play}>
        {ROWS.map((row) =>
          more && !row.preview && row.local ? (
            <button
              key={row.title}
              type="button"
              className={styles.toggle}
              aria-expanded={open}
              aria-controls={panel}
              onClick={() => setOpen((v) => !v)}
            >
              <span>
                {row.title}
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M6 1v10M1 6h10" />
                </svg>
              </span>
              <span>{row.line}</span>
            </button>
          ) : (
            <Link
              key={row.title}
              href={row.local ? `${base}${row.href}` : row.href}
              onPointerEnter={(e) => show(e.currentTarget, row.preview)}
              onPointerLeave={() => setOn(false)}
            >
              <span>{row.title}</span>
              <span>{row.line}</span>
            </Link>
          ),
        )}
      </div>
      {more ? (
        <div
          id={panel}
          className={`${styles.more} ${open ? styles.open : ""}`}
          inert={!open}
        >
          <div>{more}</div>
        </div>
      ) : null}
      <img
        ref={peek}
        className={`${styles.peek} ${on ? styles.on : ""}`}
        src={src}
        alt=""
        aria-hidden="true"
      />
    </section>
  );
}
