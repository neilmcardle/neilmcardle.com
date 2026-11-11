import type { Metadata, Viewport } from "next";
import { share } from "@/app/shared-metadata";
import BookCard from "@/app/_home/BookCard";
import styles from "../plink-pond/plink-pond.module.css";
import book from "./cs6-book.module.css";

const DESCRIPTION =
  "The Illustrator CS6 Classroom in a Book I taught myself with, in 3D. Turn it round and open it.";

export const metadata: Metadata = {
  title: "Illustrator CS6 book · Neil McArdle",
  description: DESCRIPTION,
  ...share({
    title: "Illustrator CS6 book",
    description: DESCRIPTION,
    path: "/explorations/cs6-book",
  }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
  colorScheme: "dark",
};

export default function Cs6BookPage() {
  return (
    <main className={`${styles.page} ${book.page}`}>
      <style>{"html,body{background:#0d0d0c;color-scheme:dark}"}</style>
      <header className={styles.intro}>
        <h1 className={styles.title}>Illustrator CS6 book</h1>
        <p className={styles.lede}>
          <span className={styles.subject}>
            The book I taught myself Illustrator with.
          </span>{" "}
          I bought it while I was working in PR in London, and it got me my
          first design job.
        </p>
      </header>
      <figure className={`${styles.figure} ${book.figure}`}>
        <BookCard image="/home/play/cs6-book.jpg" />
        <figcaption className={styles.caption}>
          Drag to turn it, and tap or press Enter to open it. I modelled it in
          Blender from a photo of my copy.
        </figcaption>
      </figure>
    </main>
  );
}
