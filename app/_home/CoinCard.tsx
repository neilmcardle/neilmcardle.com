"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

export default function CoinCard() {
  const stage = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let stop: (() => void) | undefined;
    let off = false;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        const still = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        import("./coinScene")
          .then((m) => m.mountCoin(el, { still }))
          .then((cleanup) => {
            if (off) cleanup();
            else {
              stop = cleanup;
              setReady(true);
            }
          })
          .catch(() => {});
      },
      { rootMargin: "400px 0px" },
    );
    near.observe(el);
    return () => {
      off = true;
      near.disconnect();
      stop?.();
    };
  }, []);

  return (
    <div
      ref={stage}
      className={`${styles.coinCard} ${ready ? styles.on : ""}`}
      role="img"
      aria-label="A black coin with my N logo struck on both sides"
    />
  );
}
