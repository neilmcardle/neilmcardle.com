"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

const NParticles = dynamic(() => import("@/app/explorations/_lab/NParticles"), {
  ssr: false,
});

export default function ExplorationPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setReady(true);
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.preview}>
      {ready ? (
        <NParticles interactive={false} className={styles.previewCanvas} />
      ) : null}
    </div>
  );
}
