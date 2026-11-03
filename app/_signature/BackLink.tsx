"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { RETURNING, VISITED } from "./Visited";
import styles from "./header.module.css";

export default function BackLink({
  fallback,
  label,
}: {
  fallback: string;
  label: string;
}) {
  const router = useRouter();
  const inside = useRef(false);

  useEffect(() => {
    try {
      inside.current = sessionStorage.getItem(VISITED) === "1";
    } catch {}
  }, []);

  return (
    <Link
      className={`${styles.brand} ${styles.back}`}
      href={fallback}
      onClick={(event) => {
        if (
          !inside.current ||
          window.history.length < 2 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.button !== 0
        )
          return;
        event.preventDefault();
        try {
          sessionStorage.setItem(RETURNING, "1");
        } catch {}
        router.back();
      }}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M10 3 5 8l5 5" />
      </svg>
      {label}
    </Link>
  );
}
