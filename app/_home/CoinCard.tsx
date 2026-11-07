"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

type Handle = { stop: () => void };

export default function CoinCard() {
  const stage = useRef<HTMLDivElement>(null);
  const handle = useRef<Handle | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
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
          .then((h) => {
            if (off) h.stop();
            else {
              handle.current = h;
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
      handle.current?.stop();
      handle.current = null;
    };
  }, []);

  return (
    <div
      ref={stage}
      className={`${styles.coinCard} ${ready ? styles.on : ""}`}
      role="img"
      aria-label="A black coin that reads Ship it on one side and Roll back on the other"
    />
  );
}
