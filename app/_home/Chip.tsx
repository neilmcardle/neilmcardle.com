"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LOGOMARK_PATH, LOGOMARK_VIEWBOX } from "@/app/coverly/logomark";
import { createSample } from "@/lib/coverly/sfx";
import Brand from "./Brand";
import styles from "./home.module.css";

const pop = createSample("/kids-alphabet/sounds/bubble-pop.mp3", () => true, {
  gap: 120,
  live: true,
});

function Mark({ id }: { id: string }) {
  if (id === "makeebook")
    return (
      <span className={`${styles.mark} ${styles.markMakeebook}`}>
        <img src="/make-ebook/brand/mark.svg" alt="" />
      </span>
    );
  if (id === "coverly")
    return (
      <span className={`${styles.mark} ${styles.markCoverly}`}>
        <svg viewBox={LOGOMARK_VIEWBOX} aria-hidden="true">
          <path d={LOGOMARK_PATH} />
        </svg>
      </span>
    );
  if (id === "avis")
    return (
      <span className={`${styles.mark} ${styles.markAvis}`}>
        <span>
          <img src="/work/avis/hero-logo.jpg" alt="" />
        </span>
      </span>
    );
  if (id === "mobbin")
    return (
      <span className={`${styles.mark} ${styles.markMobbin}`}>
        <img src="/logos/mobbin-mark.svg" alt="" />
      </span>
    );
  return null;
}

export default function Chip({
  id,
  href,
  right = false,
  children,
}: {
  right?: boolean;
  id: string;
  href: string;
  children: ReactNode;
}) {
  const [shown, setShown] = useState(false);
  const touch = useRef(false);
  const self = useRef<HTMLAnchorElement>(null);

  useEffect(() => pop.prime(), []);

  useEffect(() => {
    if (!shown) return;
    const close = (event: PointerEvent) => {
      if (!self.current?.contains(event.target as Node)) setShown(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [shown]);

  return (
    <Link
      ref={self}
      className={[
        styles.chip,
        right ? styles.right : "",
        shown ? styles.shown : "",
      ]
        .filter(Boolean)
        .join(" ")}
      href={href}
      onPointerDown={(event) => {
        touch.current = event.pointerType !== "mouse";
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") pop.play(0.2);
      }}
      onClick={(event) => {
        if (!touch.current || shown) return;
        event.preventDefault();
        setShown(true);
      }}
    >
      <Mark id={id} />
      {children}
      <span className={styles.chipCard} aria-hidden="true">
        <Brand id={id} />
      </span>
    </Link>
  );
}
