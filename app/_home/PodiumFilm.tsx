"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  prefersReducedMotion,
  subscribeReducedMotion,
} from "@/components/home/motion";
import tile from "@/components/home/home.module.css";
import styles from "./home.module.css";

export default function PodiumFilm({ poster }: { poster: string }) {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => false,
  );
  const [ended, setEnded] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced || ended) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [reduced, ended]);

  return (
    <div className={styles.podiumFilm}>
      <video
        ref={ref}
        className={styles.film}
        src="/home/podium/film.mp4"
        poster={poster}
        aria-label="The camera finds the boy on the podium deck below Petticoat Tower"
        muted
        playsInline
        preload="none"
        controls={reduced && !ended}
        onEnded={() => setEnded(true)}
      />
      {ended ? (
        <div className={styles.podiumEnd}>
          <Image
            src="/home/podium/logo.png"
            alt="Podium"
            width={624}
            height={306}
            sizes="(max-width: 600px) 50vw, 260px"
          />
          <div className={tile.mbControls} data-pinned="true">
            <button
              type="button"
              className={tile.mbControl}
              aria-label="Play the Podium film again"
              onClick={() => {
                const video = ref.current;
                if (!video) return;
                video.currentTime = 0;
                setEnded(false);
                video.play().catch(() => {});
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                aria-hidden="true"
              >
                <path
                  d="M4 2.4v9.2a.5.5 0 00.76.43l7.2-4.6a.5.5 0 000-.86l-7.2-4.6A.5.5 0 004 2.4z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
