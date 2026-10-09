"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./home.module.css";

type Item = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const still = (name: string, alt: string): Item => ({
  src: `/home/podium/stills/${name}.jpg`,
  alt,
  width: 1600,
  height: 904,
});

const ITEMS: Item[] = [
  still(
    "01-wake",
    "A boy wakes in the only pool of light in the car park under the podium",
  ),
  still("03-ramp", "He walks up the car park ramp into blinding mist"),
  still("02-hand", "A small hand in a blue sleeve touches a puddle"),
  still(
    "05-searchlight",
    "A searchlight sweeps the deck as he drops behind a planter",
  ),
  still(
    "13-pigeons",
    "A storm of pigeons lifts off around him in front of the tower",
  ),
  {
    src: "/home/podium/tower.jpg",
    alt: "The boy alone on the deck below Petticoat Tower, the City's towers in the fog behind",
    width: 1600,
    height: 905,
  },
  still("20-looking-up", "Behind his head, looking up at the tower"),
  still("12-bin-puzzle", "He shoulders a wheelie bin under the wall"),
  still("11-ledge", "He hauls himself up a wet concrete ledge"),
  still("09-shutters", "Shutters slam over him on Petticoat Lane after hours"),
  still(
    "14-washing-lines",
    "He runs through white sheets whipping on rooftop washing lines",
  ),
  still("08-the-jump", "The walkway runs out and he jumps the gap"),
  still(
    "15-train",
    "A train strobes under the footbridge at Liverpool Street as he crosses",
  ),
  still(
    "22-dream",
    "The podium decks fold and turn in the sky around the tower",
  ),
  still(
    "21-the-door",
    "A door at the foot of the tower opens and warm light floods the wet concrete",
  ),
];

export default function PodiumGallery() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const count = ITEMS.length;
  const step = (by: number) => setIndex((i) => (i + by + count) % count);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };

  const item = ITEMS[index];

  return (
    <>
      <ul className={styles.podiumStills} aria-label="Podium trailer stills">
        {ITEMS.map((entry, i) => (
          <li key={entry.src}>
            <button
              type="button"
              className={styles.podiumStill}
              onClick={() => open(i)}
              aria-label={`View larger: ${entry.alt}`}
            >
              <Image
                src={entry.src}
                alt=""
                width={entry.width}
                height={entry.height}
                sizes={
                  i === 0
                    ? "(max-width: 960px) 100vw, 720px"
                    : "(max-width: 960px) 50vw, 360px"
                }
              />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialogRef}
        className={styles.podiumViewer}
        aria-label="Podium still"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
      >
        <div className={styles.podiumViewerFigure}>
          <Image
            key={item.src}
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            sizes="(max-width: 1700px) 92vw, 1600px"
          />
        </div>
        <div className={styles.podiumViewerControls}>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous still"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next still">
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
    </>
  );
}
