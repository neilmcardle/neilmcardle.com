"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

const ParticleLab = dynamic(() => import("./ParticleLab"), { ssr: false });

const credit = (
  <p className={styles.caption}>
    Inspired by{" "}
    <a
      className={styles.handle}
      href="https://heyneuma.com/"
      target="_blank"
      rel="noopener noreferrer"
    >
      Neuma
    </a>{" "}
    by{" "}
    <a
      className={styles.handle}
      href="https://x.com/krispuckett"
      target="_blank"
      rel="noopener noreferrer"
    >
      @krispuckett
    </a>
  </p>
);

export default function ExplorationLab() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setReady(true);
      observer.disconnect();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.lab}>
      {ready ? (
        <ParticleLab>{credit}</ParticleLab>
      ) : (
        <>
          <div className={styles.labStage} />
          {credit}
        </>
      )}
    </div>
  );
}
