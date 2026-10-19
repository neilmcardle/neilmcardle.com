"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CoverCard } from "@/lib/coverly/queries";
import { SimilarCovers } from "../../coverly/browse/similar-covers";
import styles from "../case.module.css";

export default function SimilarRow({ covers }: { covers: CoverCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [height, setHeight] = useState(160);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const size = () => {
      const room = box.clientWidth * 0.84 - 40 - 12 * (covers.length - 1);
      setHeight(
        Math.round(Math.min(200, Math.max(96, room / (covers.length * 0.74)))),
      );
    };
    size();
    const observer = new ResizeObserver(size);
    observer.observe(box);
    return () => observer.disconnect();
  }, [covers.length]);

  return (
    <div ref={ref} className={styles.similar}>
      <div className={styles.similarRow}>
        <SimilarCovers
          covers={covers}
          height={height}
          onOpen={() => router.push("/coverly/browse")}
          onLoad={() => undefined}
        />
      </div>
    </div>
  );
}
