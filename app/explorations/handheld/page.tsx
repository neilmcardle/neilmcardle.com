import type { Metadata, Viewport } from "next";
import styles from "./handheld.module.css";

export const metadata: Metadata = {
  title: "Handheld · Neil McArdle",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f3f1ec",
};

export default function HandheldPage() {
  return (
    <div className={styles.page}>
      <style>{"html,body{background:#f3f1ec}"}</style>
      <iframe
        className={styles.jig}
        src="https://embed.ask.jig.com/embed/GhNDuRm0SrUV"
        title="Game Boy Portfolio: Neil McArdle"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        allow="fullscreen; autoplay"
        allowFullScreen
      />
    </div>
  );
}
