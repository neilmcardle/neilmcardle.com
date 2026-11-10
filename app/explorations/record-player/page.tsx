import type { Metadata, Viewport } from "next";
import { share } from "@/app/shared-metadata";
import Piece from "./Piece";
import styles from "./record-player.module.css";

const DESCRIPTION =
  "A hand-inked suitcase record player you can open, play and see inside.";

export const metadata: Metadata = {
  title: "Record player · Neil McArdle",
  description: DESCRIPTION,
  ...share({
    title: "Record player",
    description: DESCRIPTION,
    path: "/explorations/record-player",
  }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
  colorScheme: "dark",
};

export default function RecordPlayerPage() {
  return (
    <main className={styles.page}>
      <style>{"html,body{background:#0d0d0c;color-scheme:dark}"}</style>
      <header className={styles.intro}>
        <h1 className={styles.title}>Record player</h1>
        <p className={styles.lede}>
          <span className={styles.subject}>
            A suitcase record player you can open, play and see inside.
          </span>{" "}
          Every part works, from the lid catch to the tone arm.
        </p>
      </header>
      <figure className={styles.figure}>
        <Piece />
        <figcaption className={styles.caption}>
          Open the lid, pick a record, switch it on and drop the needle. Drag to
          turn it, and See-through shows the mechanism. I drew it with{" "}
          <a
            href="https://april-zhu.com/colorfigures"
            target="_blank"
            rel="noopener noreferrer"
          >
            Colorfigures
          </a>{" "}
          by April Zhu.
        </figcaption>
      </figure>
    </main>
  );
}
