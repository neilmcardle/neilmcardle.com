"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import Image from "next/image";
import { motionEnabled, setMotion, subscribeMotion } from "./motion";
import styles from "./home.module.css";

const FADE_MS = 600;
const RAIN_VOLUME = 0.6;

function useInView(ref: RefObject<Element | null>) {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}

function TileControls({
  label,
  playing,
  onPlay,
  sound,
}: {
  label: string;
  playing: boolean;
  onPlay: () => void;
  sound?: { on: boolean; onToggle: () => void };
}) {
  return (
    <div
      className={styles.mbControls}
      data-pinned={!playing || sound?.on ? "true" : undefined}
    >
      {sound ? (
        <button
          type="button"
          className={styles.mbControl}
          onClick={sound.onToggle}
          aria-pressed={sound.on}
          aria-label={`${label} sound`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 6h2.5L8 3v10L4.5 10H2z" fill="currentColor" />
            {sound.on ? (
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
      ) : null}
      <button
        type="button"
        className={styles.mbControl}
        onClick={onPlay}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          {playing ? (
            <path
              d="M3.5 2.5h2.25v9H3.5zM8.25 2.5h2.25v9H8.25z"
              fill="currentColor"
            />
          ) : (
            <path
              d="M4 2.4v9.2a.5.5 0 00.76.43l7.2-4.6a.5.5 0 000-.86l-7.2-4.6A.5.5 0 004 2.4z"
              fill="currentColor"
            />
          )}
        </svg>
      </button>
    </div>
  );
}

export default function MakeEbookMocks({
  only,
}: {
  only?: "rain" | "lockup" | "video";
}) {
  const moving = useSyncExternalStore(
    subscribeMotion,
    motionEnabled,
    () => true,
  );
  const rainRef = useRef<HTMLDivElement>(null);
  const videoTileRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rainInView = useInView(rainRef);
  const videoInView = useInView(videoTileRef);
  const [rainPlaying, setRainPlaying] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [rainSound, setRainSound] = useState(false);

  const rainShown = moving && rainPlaying;
  const videoShown = moving && videoPlaying;
  const rainActive = rainShown && rainInView;
  const videoActive = videoShown && videoInView;
  const rainAudible = rainSound && rainActive;

  const start = (play: (on: boolean) => void) => {
    play(true);
    if (!moving) setMotion(true);
  };

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const send = () =>
      frame.contentWindow?.postMessage(
        { type: "playback", playing: rainActive },
        window.location.origin,
      );
    send();
    frame.addEventListener("load", send);
    return () => frame.removeEventListener("load", send);
  }, [rainActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (videoActive) video.play().catch(() => undefined);
    else video.pause();
  }, [videoActive]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (rainAudible) {
      if (audio.paused) {
        audio.volume = 0;
        audio.play().catch(() => setRainSound(false));
      }
    } else if (audio.paused) {
      return;
    }
    const from = audio.volume;
    const to = rainAudible ? RAIN_VOLUME : 0;
    const began = performance.now();
    const timer = window.setInterval(() => {
      const t = Math.min(1, Math.max(0, (performance.now() - began) / FADE_MS));
      audio.volume = from + (to - from) * t;
      if (t < 1) return;
      window.clearInterval(timer);
      if (!rainAudible) audio.pause();
    }, 30);
    return () => window.clearInterval(timer);
  }, [rainAudible]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  return (
    <div className={styles.mbStack}>
      {(!only || only === "rain") && (
        <div className={styles.mbRain} ref={rainRef}>
          <iframe
            ref={frameRef}
            src="/make-ebook/brand/rain-on-glass.html?bg=/make-ebook/brand/library-lamp.jpg"
            title="makeebook"
            tabIndex={-1}
            loading="lazy"
            aria-hidden="true"
            className={styles.mbRainCanvas}
          />
          <Image
            src="/make-ebook/brand/mark.svg"
            alt=""
            width={82}
            height={30}
            className={styles.mbRainMark}
          />
          <audio
            ref={audioRef}
            src="/audio/rain-light.mp3"
            loop
            preload="none"
          />
          <TileControls
            label="rain"
            playing={rainShown}
            onPlay={() =>
              rainShown ? setRainPlaying(false) : start(setRainPlaying)
            }
            sound={{
              on: rainSound,
              onToggle: () => {
                if (!rainSound && !rainShown) start(setRainPlaying);
                setRainSound(!rainSound);
              },
            }}
          />
        </div>
      )}

      {(!only || only === "lockup") && (
        <div className={styles.mbGrid} aria-hidden="true">
          <span className={styles.mbGridFrame}>
            <Image
              src="/make-ebook/brand/mark.svg"
              alt=""
              width={82}
              height={30}
              className={styles.mbLockupMark}
            />
            <span className={styles.mbWordmark}>makeebook</span>
          </span>
        </div>
      )}

      {(!only || only === "video") && (
        <div className={styles.mbVideo} ref={videoTileRef}>
          <video
            ref={videoRef}
            src="/make-ebook/brand/writer-video-bg.mp4"
            poster="/make-ebook/brand/hero-writer.jpg"
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
          <TileControls
            label="video"
            playing={videoShown}
            onPlay={() =>
              videoShown ? setVideoPlaying(false) : start(setVideoPlaying)
            }
          />
        </div>
      )}
    </div>
  );
}
