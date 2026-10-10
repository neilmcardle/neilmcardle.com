"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./home.module.css";

export type GalleryItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const ICONS = {
  grid: (
    <>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </>
  ),
  phone: (
    <>
      <rect x="4.5" y="1.5" width="7" height="13" rx="1.75" />
      <path d="M7 12.25h2" />
    </>
  ),
};

export default function Gallery({
  items,
  label,
  name,
  icon = "grid",
  preview = 0,
}: {
  items: GalleryItem[];
  label: string;
  name: string;
  icon?: keyof typeof ICONS;
  preview?: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [viewing, setViewing] = useState(false);
  const count = items.length;
  const step = (by: number) => setIndex((i) => (i + by + count) % count);

  const open = (i: number) => {
    setIndex(i);
    setViewing(true);
    dialogRef.current?.showModal();
  };

  const item = items[index];

  return (
    <div className={styles.gallery}>
      {preview > 0 ? (
        <ul className={styles.galleryPreview}>
          {items.slice(0, preview).map((entry, i) => (
            <li key={entry.src}>
              <button
                type="button"
                className={styles.galleryThumb}
                onClick={() => open(i)}
                aria-label={`View larger: ${entry.alt}`}
              >
                <Image
                  src={entry.src}
                  alt=""
                  width={entry.width}
                  height={entry.height}
                  sizes="(max-width: 960px) 50vw, 360px"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <button
        type="button"
        className={styles.galleryLink}
        onClick={() => open(0)}
        aria-haspopup="dialog"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {ICONS[icon]}
        </svg>
        <span>{label}</span>
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => setViewing(false)}
        className={styles.viewer}
        aria-label={name}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
      >
        <div className={styles.viewerFigure}>
          {viewing ? (
            <Image
              key={item.src}
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(max-width: 1700px) 92vw, 1600px"
              loading="eager"
              style={{
                width: `min(100%, (100svh - 160px) * ${item.width} / ${item.height})`,
                aspectRatio: `${item.width} / ${item.height}`,
              }}
            />
          ) : null}
        </div>
        <div className={styles.viewerControls}>
          <button type="button" onClick={() => step(-1)} aria-label="Previous">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
      </dialog>
    </div>
  );
}
