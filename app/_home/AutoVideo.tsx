"use client";

import { useEffect, useRef, type ComponentProps } from "react";

export default function AutoVideo(props: ComponentProps<"video">) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ours = false;
    let stopped = false;
    const onPause = () => {
      if (!ours && !video.ended) stopped = true;
      ours = false;
    };
    const onPlay = () => {
      stopped = false;
    };
    video.addEventListener("pause", onPause);
    video.addEventListener("play", onPlay);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!stopped && video.paused) video.play().catch(() => {});
        } else if (!video.paused) {
          ours = true;
          video.pause();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.removeEventListener("pause", onPause);
      video.removeEventListener("play", onPlay);
    };
  }, []);

  return <video ref={ref} {...props} />;
}
