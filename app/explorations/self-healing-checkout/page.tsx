import type { Metadata, Viewport } from "next";
import styles from "./self-healing-checkout.module.css";

export const metadata: Metadata = {
  title: "Self-healing checkout · Neil McArdle",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
};

export default function SelfHealingCheckoutPage() {
  return (
    <div className={styles.page}>
      <style>{"html,body{background:#0f0f0f}"}</style>
      <iframe
        className={styles.figure}
        src="/explorations/self-healing-checkout/index.html"
        title="Self-healing checkout: a console that spots a broken checkout and ships the fix, with sample data"
      />
    </div>
  );
}
