import type { Metadata, Viewport } from "next";
import styles from "./record-player.module.css";

export const metadata: Metadata = {
  title: "Record player · Neil McArdle",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f2efe7",
};

export default function RecordPlayerPage() {
  return (
    <div className={styles.page}>
      <style>{"html,body{background:#f2efe7}"}</style>
      <iframe
        className={styles.figure}
        src="/explorations/record-player/figure.html"
        title="Record player: a suitcase portable you can open, play and see inside"
      />
    </div>
  );
}
