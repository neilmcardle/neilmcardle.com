"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { COVERS } from "./covers";
import { slug } from "./data";
import { Viewer, type ViewerHandle } from "./Gallery";
import styles from "./home.module.css";

const ITEMS = COVERS.map((cover) => ({
  src: cover.image,
  alt: `Cover of ${cover.title} by ${cover.author}`,
  width: cover.width,
  height: cover.height,
}));

export default function CoverShelf() {
  const [hot, setHot] = useState<number | null>(null);
  const viewerRef = useRef<ViewerHandle>(null);
  const leave = (i: number) =>
    setHot((current) => (current === i ? null : current));

  return (
    <div className={styles.shelf} data-hot={hot !== null || undefined}>
      <ul className={styles.shelfBooks} aria-label="Covers">
        {COVERS.map((cover, i) => (
          <li
            key={cover.title}
            className={styles.shelfSlot}
            data-item={slug(cover.title)}
            data-on={hot === i || undefined}
          >
            <button
              type="button"
              className={styles.shelfBook}
              aria-haspopup="dialog"
              aria-label={`View larger: ${cover.title}, ${cover.year} edition`}
              onPointerEnter={() => setHot(i)}
              onPointerLeave={() => leave(i)}
              onFocus={() => setHot(i)}
              onBlur={() => leave(i)}
              onClick={() => viewerRef.current?.open(i)}
            >
              <Image
                src={cover.image}
                alt=""
                width={cover.width}
                height={cover.height}
                sizes="(max-width: 599px) 28vw, 200px"
              />
            </button>
          </li>
        ))}
      </ul>
      <ul className={styles.shelfCaptions} aria-hidden="true">
        {COVERS.map((cover, i) => (
          <li key={cover.title} data-on={hot === i || undefined}>
            <span className={styles.coverTitle}>{cover.title}</span>
            <span className={styles.coverMeta}>
              {cover.year} edition
              <br />
              First published {cover.original}
            </span>
          </li>
        ))}
      </ul>
      <Viewer ref={viewerRef} items={ITEMS} name="Book covers" />
    </div>
  );
}
