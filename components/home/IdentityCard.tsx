"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

const DOT_TILE = "4.45361px 4.46743px";

const BASE_FADE =
  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.62) 42%, rgba(0,0,0,0.97) 66%, rgb(0,0,0) 100%)";

const MAX_TILT = 8;
const CARD_W = 336;

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
  }, []);

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!fine || reducedRef.current || lean !== "none") return;
      const tilt = tiltRef.current;
      const band = bandRef.current;
      if (!tilt) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      tilt.style.transition = "none";
      tilt.style.transform = `rotateX(${(0.5 - y) * 2 * MAX_TILT}deg) rotateY(${(x - 0.5) * 2 * MAX_TILT}deg)`;
      if (band)
        band.style.transform = `translateX(${x * CARD_W}px) rotate(-18deg)`;
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
              left: 16,
              top: 16,
              height: 316,
              width: 304,
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
              left: -13,
              top: 8,
              height: 384,
              width: 362,
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
              top: 192,
              height: 288,
              width: 336,
              backgroundImage: BASE_FADE,
            }}
          />

          <div className={styles.idName}>
            <h2>
              <span>NEIL</span>
              <span>McARDLE</span>
            </h2>
            <p className={styles.idRole}>Artist · Designer · London</p>
          </div>
        </div>
      </div>
    </div>
  );
}
