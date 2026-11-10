"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import styles from "./record-player.module.css";

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
          src="/explorations/record-player/still.jpg"
          alt="A hand-inked red suitcase record player with its lid shut, on a mat beside two record sleeves."
          fill
          sizes="(min-width: 960px) 80vw, 100vw"
        />
        <button
          type="button"
          className={styles.play}
          onClick={() => setStarted(true)}
        >
          Open the record player
        </button>
      </div>
    );
  }

  return (
    <iframe
      className={styles.stage}
      src="/explorations/record-player/figure.html"
      title="Record player: a suitcase portable you can open, play and see inside"
    />
  );
}
