"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import styles from "./plink-pond.module.css";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const readReduced = () => window.matchMedia(QUERY).matches;
const readServer = (): boolean | null => null;

export default function Piece() {
  const reduced = useSyncExternalStore<boolean | null>(
    subscribe,
    readReduced,
    readServer,
  );
  const [started, setStarted] = useState(false);

  if (reduced === null) return <div className={styles.stage} />;

  if (reduced && !started) {
    return (
      <div className={styles.stage}>
        <Image
          className={styles.still}
          src="/explorations/plink-pond/still.jpg"
          alt="The pixel pond at rest: a dock on the near bank, lily pads, two ducks and the far bank."
          fill
          sizes="(min-width: 960px) 80vw, 100vw"
        />
        <button
          type="button"
          className={styles.play}
          onClick={() => setStarted(true)}
        >
          Play the pond
        </button>
      </div>
    );
  }

  return (
    <iframe
      className={styles.stage}
      src="/explorations/plink-pond/game.html"
      title="Plink Pond: skim stones across a pixel pond"
    />
  );
}
