import type { Metadata, Viewport } from "next";
import { share } from "@/app/shared-metadata";
import Piece from "./Piece";
import styles from "./plink-pond.module.css";

const DESCRIPTION =
  "A tiny isometric pixel pond for skimming stones. Bounce off lily pads, startle the ducks, reach the far bank.";

export const metadata: Metadata = {
  title: "Plink Pond · Neil McArdle",
  description: DESCRIPTION,
  ...share({
    title: "Plink Pond",
    description: DESCRIPTION,
    path: "/explorations/plink-pond",
  }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
  colorScheme: "dark",
};

export default function PlinkPondPage() {
  return (
    <main className={styles.page}>
      <style>{"html,body{background:#0d0d0c;color-scheme:dark}"}</style>
      <header className={styles.intro}>
        <h1 className={styles.title}>Plink Pond</h1>
        <p className={styles.lede}>
          <span className={styles.subject}>
            A tiny pixel pond for skimming stones.
          </span>{" "}
          Bounce off the lily pads, startle the ducks and see if you can reach
          the far bank.
        </p>
      </header>
      <figure className={styles.figure}>
        <Piece />
        <figcaption className={styles.caption}>
          Point at the water to aim, click once to set the power and again to
          set the tilt. Arrow keys aim and space throws. The pixel style nods to{" "}
          <a
            href="https://pixel-plays-ruby.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pixel Plays
          </a>{" "}
          by Amir Mušić and abhi.
        </figcaption>
      </figure>
    </main>
  );
}
