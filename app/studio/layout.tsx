import type React from "react";
import type { Metadata } from "next";
import StudioChrome from "./StudioChrome";
import styles from "./studio.module.css";

export const metadata: Metadata = {
  title: {
    default: "Signal & Noise",
    template: "%s. Signal & Noise",
  },
  description:
    "Signal & Noise is Neil McArdle's design exploration studio: generative graphics made from small rules, printed, applied and set in motion.",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <div className={styles.shell}>
          <StudioChrome />
          {children}
        </div>
      </div>
    </div>
  );
}
