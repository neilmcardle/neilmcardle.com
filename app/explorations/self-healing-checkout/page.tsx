import type { Metadata, Viewport } from "next";
import styles from "./self-healing-checkout.module.css";

const TITLE = "Self-healing checkout · Neil McArdle";
const DESCRIPTION =
  "A concept: a self-healing console that spots a broken checkout and ships the fix. Sample data.";
const IMAGE = {
  url: "/og/self-healing-checkout.jpg",
  width: 1200,
  height: 630,
  alt: "A console showing a checkout pay button hidden under the iPhone browser toolbar, next to the proposed fix",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/explorations/self-healing-checkout",
    siteName: "Neil McArdle",
    type: "website",
    locale: "en_GB",
    images: [IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@BetterNeil",
    images: [IMAGE],
  },
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
