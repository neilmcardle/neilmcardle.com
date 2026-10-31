"use client";

import { useEffect, useState } from "react";
import shell from "./signature.module.css";
import styles from "./hero.module.css";

export default function Hero() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <section
      className={`${shell.wrap} ${styles.hero} ${shown ? styles.shown : ""}`}
    >
      <h1 className={`${shell.heavy} ${styles.name}`} aria-label="Neil McArdle">
        NEIL McARDLE.
      </h1>
      <p className={styles.role}>Product Designer</p>
      <p className={styles.site}>London</p>
    </section>
  );
}
