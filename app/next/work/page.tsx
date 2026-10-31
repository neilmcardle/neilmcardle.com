import type { Metadata, Viewport } from "next";
import Shell from "../../_signature/Shell";
import Header from "../../_signature/Header";
import Work from "../../_signature/Work";
import Index from "../../_signature/Index";
import Finale from "../../_signature/Finale";
import shell from "../../_signature/signature.module.css";
import styles from "../../_signature/index.module.css";

export const metadata: Metadata = {
  title: "Work · Neil McArdle",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function NextWork() {
  return (
    <Shell>
      <Header home="/next" />
      <div className={`${shell.wrap} ${styles.opening}`}>
        <h1 className={styles.title}>All work</h1>
        <p className={styles.intro}>
          Products I design and build, the work behind them, and the things I
          make for fun.
        </p>
      </div>
      <Work base="/next" />
      <Index base="/next" />
      <Finale />
    </Shell>
  );
}
