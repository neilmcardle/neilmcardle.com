import type { Metadata, Viewport } from "next";
import Shell from "../_signature/Shell";
import Header from "../_signature/Header";
import Work from "../_signature/Work";
import Index from "../_signature/Index";
import Finale from "../_signature/Finale";
import { share } from "../shared-metadata";
import shell from "../_signature/signature.module.css";
import styles from "../_signature/index.module.css";

const description =
  "Products I design and build, the work behind them, and the things I make for fun.";

export const metadata: Metadata = {
  title: "Work · Neil McArdle",
  description,
  ...share({ title: "Work · Neil McArdle", description, path: "/work" }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function WorkPage() {
  return (
    <Shell>
      <Header />
      <div className={`${shell.wrap} ${styles.opening}`}>
        <h1 className={styles.title}>All work</h1>
        <p className={styles.intro}>
          Products I design and build, the work behind them, and the things I
          make for fun.
        </p>
      </div>
      <Work />
      <Index />
      <Finale copyEmail />
    </Shell>
  );
}
