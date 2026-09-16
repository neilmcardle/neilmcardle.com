"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./brand.module.css";

const SRC = "/make-ebook/brand/writer-video-bg.mp4";
const POSTER = "/make-ebook/brand/hero-writer.jpg";
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);
const MAX_VOLUME = 0.9;
const FADE_SECONDS = 0.35;
const LOOP_TAIL = 0.12;
const LOOP_HEAD = 0.02;
const AUDIO_TRIM = 0.05;

type VideoWithFrames = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: () => void) => number;
};

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const control = useRef<{ toggle: () => void }>({ toggle: () => {} });
  const [audible, setAudible] = useState(false);

  useEffect(() => {
    const video = ref.current as VideoWithFrames | null;
    if (!video) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let ratio = 0;
    let heroRatio = 0;
    let introRatio = 0;
    let wantSound = true;
    let unlocked = false;
    let playing = false;
    let disposed = false;
    let context: AudioContext | null = null;
    let gain: GainNode | null = null;
    let loading: Promise<void> | null = null;

    const targetGain = () => {
      if (!wantSound || !unlocked) return 0;
      return Math.pow(Math.min(1, ratio * 1.15), 1.4) * MAX_VOLUME;
    };

    const report = () => {
      playing = !!context && context.state === "running" && targetGain() > 0.02;
      setAudible(playing);
    };

    const applyGain = () => {
      if (!context || !gain) return;
      gain.gain.setTargetAtTime(
        targetGain(),
        context.currentTime,
        FADE_SECONDS / 3,
      );
      report();
    };

    const ensureAudio = () => {
      if (loading) return loading;
      loading = (async () => {
        const ctx = new AudioContext();
        const bytes = await fetch(SRC).then((r) => r.arrayBuffer());
        const buffer = await ctx.decodeAudioData(bytes);
        if (disposed) {
          ctx.close();
          return;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.loopStart = 0;
        source.loopEnd = Math.max(0.5, buffer.duration - AUDIO_TRIM);
        const node = ctx.createGain();
        node.gain.value = 0;
        source.connect(node).connect(ctx.destination);
        source.start();
        context = ctx;
        gain = node;
        ctx.onstatechange = report;
        applyGain();
      })().catch(() => {
        loading = null;
      });
      return loading;
    };

    const syncVideo = () => {
      if (heroRatio > 0 && video.paused) video.play().catch(() => {});
      if (heroRatio === 0 && !video.paused) video.pause();
    };

    const rewind = () => {
      if (video.duration && video.duration - video.currentTime < LOOP_TAIL) {
        video.currentTime = LOOP_HEAD;
      }
    };
    const watchFrames = () => {
      rewind();
      if (!video.paused) video.requestVideoFrameCallback?.(watchFrames);
    };
    const onPlay = () => {
      if (video.requestVideoFrameCallback)
        video.requestVideoFrameCallback(watchFrames);
    };

    const intro = document.getElementById("intro");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === video) heroRatio = entry.intersectionRatio;
          else introRatio = entry.intersectionRatio;
        }
        ratio = Math.max(heroRatio, introRatio);
        if (!reduced || unlocked) syncVideo();
        if (unlocked) {
          if (context) applyGain();
          else if (ratio > 0) ensureAudio();
        }
      },
      { threshold: THRESHOLDS },
    );
    observer.observe(video);
    if (intro) observer.observe(intro);

    const unlock = async () => {
      unlocked = true;
      await ensureAudio();
      if (context && context.state !== "running")
        await context.resume().catch(() => {});
      syncVideo();
      applyGain();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    video.addEventListener("play", onPlay);
    video.addEventListener("timeupdate", rewind);

    control.current = {
      toggle: () => {
        wantSound = !playing;
        void unlock();
      },
    };

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("timeupdate", rewind);
      context?.close();
    };
  }, []);

  const toggle = useCallback(() => control.current.toggle(), []);

  return (
    <>
      <video
        ref={ref}
        className={styles.heroVideo}
        src={SRC}
        poster={POSTER}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <button
        type="button"
        className={styles.heroSound}
        onClick={toggle}
        aria-pressed={audible}
        aria-label={audible ? "Turn sound off" : "Turn sound on"}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 6h2.5L8 3v10L4.5 10H2z" fill="currentColor" />
          {audible ? (
            <path
              d="M10.5 5.5a3.5 3.5 0 010 5M12.5 3.5a6.5 6.5 0 010 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M10.5 6l3 4M13.5 6l-3 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
    </>
  );
}
