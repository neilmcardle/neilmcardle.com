"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

const BASE_FADE =
  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 52%, rgba(0,0,0,0.88) 80%, rgb(0,0,0) 100%)";

const DOT_TILE = "1.3255cqw 1.3296cqw";

const MAX_TILT = 8;

export type Lean = "none" | "left" | "right" | "back";

const LEAN_ROTATE: Record<Lean, string> = {
  none: "none",
  left: "y -14deg",
  right: "y 14deg",
  back: "x 11deg",
};

export default function IdentityCard({ lean = "none" }: { lean?: Lean }) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const [glint, setGlint] = useState(false);

  const [fine, setFine] = useState(false);
  const hoverRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setFine(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  const enter = useCallback(() => {
    if (!fine || reducedRef.current) return;
    hoverRef.current = true;
    setGlint(true);

    bandRef.current?.classList.remove(styles.idSweep);
  }, [fine]);

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!fine || reducedRef.current || lean !== "none") return;
      const tilt = tiltRef.current;
      const band = bandRef.current;
      if (!tilt) return;
      if (!hoverRef.current) {
        hoverRef.current = true;
        setGlint(true);
      }
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      tilt.style.transition = "none";
      tilt.style.transform = `rotateX(${(0.5 - y) * 2 * MAX_TILT}deg) rotateY(${(x - 0.5) * 2 * MAX_TILT}deg)`;
      if (band)
        band.style.transform = `translateX(${x * 100}cqw) rotate(-18deg)`;
    },
    [fine, lean],
  );

  const reset = useCallback(() => {
    hoverRef.current = false;
    setGlint(false);
    const tilt = tiltRef.current;
    if (!tilt) return;
    tilt.style.transition = "";
    tilt.style.transform = "";
  }, []);

  const sweep = useCallback(() => {
    const band = bandRef.current;
    if (!band || reducedRef.current) return;
    setGlint(true);
    band.style.transform = "";
    band.classList.remove(styles.idSweep);
    void band.offsetWidth;
    band.classList.add(styles.idSweep);
    window.setTimeout(() => {
      if (!hoverRef.current) setGlint(false);
    }, 1500);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(sweep, 700);
    return () => window.clearTimeout(t);
  }, [sweep]);

  useEffect(() => {
    if (fine && lean !== "none") sweep();
  }, [fine, lean, sweep]);

  return (
    <div
      className={styles.idOuter}
      onPointerEnter={enter}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onClick={sweep}
    >
      <div
        ref={tiltRef}
        className={styles.idTilt}
        style={{ rotate: fine ? LEAN_ROTATE[lean] : "none" }}
      >
        <div className={styles.idCard}>
          <img
            src="/hero/n-mark.svg"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "4.7619cqw",
              top: "4.7619cqw",
              height: "94.0476cqw",
              width: "90.4762cqw",
              maxWidth: "none",
            }}
          />

          <div
            aria-hidden="true"
            className={styles.idLayer}
            style={{
              backgroundImage: "url(/hero/dot-matrix.svg)",
              backgroundSize: DOT_TILE,
            }}
          />

          <div
            aria-hidden="true"
            className={`${styles.idGlint} ${glint ? styles.idGlintOn : ""}`}
          >
            <div ref={bandRef} className={styles.idBand} />
          </div>

          <Image
            src="/hero/portrait.png"
            alt="Portrait of Neil McArdle"
            width={480}
            height={480}
            priority
            style={{
              position: "absolute",
              left: "-3.869cqw",
              top: "2.381cqw",
              height: "114.2857cqw",
              width: "107.7381cqw",
              maxWidth: "none",
              objectFit: "cover",
              pointerEvents: "none",
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              height: "39.2857cqw",
              width: "100cqw",
              backgroundImage: BASE_FADE,
            }}
          />
        </div>
      </div>
    </div>
  );
}
