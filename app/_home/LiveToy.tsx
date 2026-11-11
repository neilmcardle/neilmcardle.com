"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

export default function LiveToy({
  title,
  embed,
  image,
}: {
  title: string;
  embed: string;
  image: string;
}) {
  const card = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={card} className={styles.toyCard}>
      <img
        className={`${styles.toyStill} ${ready ? styles.hidden : ""}`}
        src={image}
        alt=""
        width={720}
        height={720}
        loading="lazy"
        decoding="async"
      />
      {near ? (
        <iframe
          className={`${styles.toyFrame} ${ready ? styles.on : ""}`}
          src={embed}
          title={title}
          loading="lazy"
          onLoad={() => setReady(true)}
        />
      ) : null}
    </div>
  );
}
