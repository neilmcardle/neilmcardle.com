import type { Metadata, Viewport } from "next";
import { share } from "../../shared-metadata";
import styles from "./plink-pond.module.css";

const DESCRIPTION =
  "Skim stones across a tiny isometric pixel pond. Bounce off lily pads, startle the ducks, reach the far bank.";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#131915" },
  ],
};

export default function PlinkPondPage() {
  return (
    <div className={styles.page}>
      <iframe
        className={styles.game}
        src="/explorations/plink-pond/game.html"
        title="Plink Pond: skim stones across a pixel pond"
      />
    </div>
  );
}
