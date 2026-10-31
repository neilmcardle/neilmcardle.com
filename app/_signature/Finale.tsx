"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { media } from "@/lib/media";
import shell from "./signature.module.css";
import styles from "./finale.module.css";

const ENGINE = media("/audio/engine.mp3");
const OFFSET = 0.6;
const OCTAGON =
  "29.3,0 70.7,0 100,29.3 100,70.7 70.7,100 29.3,100 0,70.7 0,29.3";
const address = () => ["neil", ["neilmcardle", "com"].join(".")].join("@");

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  s: number;
  bright: boolean;
};

export default function Finale() {
  const finale = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const ign = useRef<HTMLDivElement>(null);
  const tach = useRef<SVGPolygonElement>(null);
  const exhaust = useRef<HTMLCanvasElement>(null);
  const start = useRef<HTMLButtonElement>(null);
  const engine = useRef<{
    audio?: AudioContext;
    bytes?: Promise<ArrayBuffer>;
    buffer?: Promise<AudioBuffer>;
  }>({});
  const closeTimer = useRef(0);
  const copyTimer = useRef(0);
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [said, setSaid] = useState("");
  const [subject, setSubject] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const target = inner.current;
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(closeTimer.current);
      window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const fetchEngine = () => {
    engine.current.bytes ??= fetch(ENGINE).then((r) => {
      if (!r.ok) throw new Error("engine");
      return r.arrayBuffer();
    });
    return engine.current.bytes;
  };

  const loadEngine = () => {
    const e = engine.current;
    e.audio ??= new AudioContext();
    const audio = e.audio;
    e.buffer ??= fetchEngine().then((b) => audio.decodeAudioData(b.slice(0)));
    return e.buffer;
  };

  const openCover = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
    fetchEngine().catch(() => {});
  };

  const hoverable = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const onCoverClick = (event: React.MouseEvent) => {
    if (event.detail === 0) {
      setInstant(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setInstant(false)),
      );
      requestAnimationFrame(() => start.current?.focus());
    }
    openCover();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address());
      setCopied("Copied");
    } catch {
      setCopied("Select the address to copy it");
    }
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(""), 1800);
  };

  const ignite = async () => {
    setRevealed(true);
    if (running) return;
    setRunning(true);
    window.clearTimeout(closeTimer.current);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stage = finale.current;
    const canvas = exhaust.current;
    const ctx = canvas?.getContext("2d");
    let buffer: AudioBuffer | undefined;
    try {
      buffer = await loadEngine();
      await engine.current.audio?.resume();
    } catch {
      buffer = undefined;
    }
    const audio = engine.current.audio;
    if (!stage || !canvas || !ctx || !audio || !buffer) {
      setRunning(false);
      setSaid("Engine’s running. What are we building?");
      setSubject(true);
      return;
    }
    const src = audio.createBufferSource();
    const analyser = audio.createAnalyser();
    analyser.fftSize = 1024;
    src.buffer = buffer;
    src.connect(analyser).connect(audio.destination);
    const t0 = audio.currentTime;
    const length = buffer.duration - OFFSET;
    src.start(t0, OFFSET);
    const samples = new Float32Array(analyser.fftSize);
    const box = stage.getBoundingClientRect();
    const k = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(box.width * k);
    canvas.height = Math.round(box.height * k);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    let puffs: Spark[] = [];
    let level = 0;
    let last = 0;

    const emit = (n: number, speed: number, bright: boolean) => {
      const at = ign.current?.getBoundingClientRect();
      const here = stage.getBoundingClientRect();
      if (!at) return;
      const ox = at.left + at.width / 2 - here.left;
      const oy = at.top + at.height / 2 - here.top;
      for (let i = 0; i < n; i++) {
        const side = Math.random() < 0.5 ? -1 : 1;
        puffs.push({
          x: ox + side * (at.width / 2 + Math.random() * 8),
          y: oy + (Math.random() - 0.5) * 12,
          vx: side * speed * (0.6 + Math.random()),
          vy: -speed * 0.35 * Math.random() - 0.6,
          life: 1,
          decay: 0.012 + Math.random() * 0.02,
          s: bright ? 2.4 : 1 + Math.random() * 1.6,
          bright,
        });
      }
    };

    const frame = () => {
      const t = audio.currentTime - t0;
      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (const v of samples) sum += v * v;
      const target = Math.min(1, Math.sqrt(sum / samples.length) / 0.24);
      level += (target - level) * (target > level ? 0.55 : 0.12);
      tach.current?.style.setProperty(
        "stroke-dashoffset",
        String(100 - level * 100),
      );
      if (!calm) {
        const shake = level > 0.25 ? level * 6 : level * 2;
        if (title.current)
          title.current.style.translate = `${(Math.random() - 0.5) * shake}px ${(Math.random() - 0.5) * shake}px`;
        stage.style.setProperty("--flare", String(Math.min(1, level * 1.2)));
        if (level > 0.04) emit(Math.round(level * 10), 2 + level * 14, false);
        if (target > 0.3 && target > last * 1.5) emit(24, 16, true);
        last = target;
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        puffs = puffs.filter((p) => p.life > 0);
        ctx.globalCompositeOperation = "lighter";
        for (const p of puffs) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx = p.vx * 0.975 + (Math.random() - 0.5) * 0.35;
          p.vy -= 0.035;
          p.life -= p.decay;
          const life = Math.max(0, p.life);
          const flicker = 0.65 + 0.35 * Math.random();
          const hue = 10 + 38 * life;
          const light = 38 + 52 * life * (p.bright ? 1 : 0.85);
          const glow = p.s * (p.bright ? 5 : 3.5);
          ctx.globalAlpha = life * flicker * 0.14;
          ctx.fillStyle = `hsl(${hue} 100% 50%)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, glow / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = life * flicker * (p.bright ? 1 : 0.8);
          ctx.fillStyle = `hsl(${hue} 100% ${light}%)`;
          ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
        }
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
      }
      if (t < length + 0.3 || puffs.length) {
        requestAnimationFrame(frame);
        return;
      }
      if (title.current) title.current.style.translate = "";
      stage.style.setProperty("--flare", "0");
      tach.current?.style.setProperty("stroke-dashoffset", "100");
      setSaid("Engine’s running. What are we building?");
      setSubject(true);
      setRunning(false);
      closeTimer.current = window.setTimeout(() => {
        if (!(hoverable() && ign.current?.matches(":hover"))) setOpen(false);
      }, 1600);
    };
    requestAnimationFrame(frame);
  };

  const mailto = revealed
    ? `mailto:${address()}${subject ? `?subject=${encodeURIComponent("Let’s start something")}` : ""}`
    : undefined;

  return (
    <section
      ref={finale}
      id="contact"
      className={`${styles.finale} ${shown ? styles.shown : ""}`}
    >
      <canvas ref={exhaust} className={styles.exhaust} aria-hidden="true" />
      <div ref={inner} className={`${shell.wrap} ${styles.inner}`}>
        <h2 ref={title} className={styles.title}>
          Tell me more.
        </h2>
        <div className={styles.row}>
          <div
            ref={ign}
            className={`${styles.ignition} ${open ? styles.open : ""} ${instant ? styles.instant : ""}`}
            onPointerEnter={() => hoverable() && openCover()}
            onPointerLeave={() => hoverable() && !running && setOpen(false)}
          >
            <span className={styles.glass} aria-hidden="true" />
            <svg
              className={styles.tach}
              viewBox="-4 -4 108 108"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="glass-rim" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity=".42" />
                  <stop offset=".45" stopColor="#fff" stopOpacity=".1" />
                  <stop offset="1" stopColor="#fff" stopOpacity=".22" />
                </linearGradient>
              </defs>
              <polygon
                points={OCTAGON}
                pathLength={100}
                stroke="url(#glass-rim)"
              />
              <polygon
                ref={tach}
                className={styles.fill}
                points={OCTAGON}
                pathLength={100}
              />
            </svg>
            <button
              ref={start}
              className={styles.start}
              type="button"
              tabIndex={open ? 0 : -1}
              disabled={running}
              aria-label="Reveal my email address"
              onClick={ignite}
            >
              <img className={styles.bezel} src="/home/lid/button.svg" alt="" />
              <img className={styles.cap} src="/home/lid/button.svg" alt="" />
              <span className={styles.capLabel} aria-hidden="true">
                Reveal
              </span>
            </button>
            <button
              className={styles.cover}
              type="button"
              aria-label="Open the cover to reveal my email"
              aria-expanded={open}
              onClick={onCoverClick}
            >
              <span className={styles.under}>
                <img src="/home/lid/lid-open.svg" alt="" />
              </span>
              {[6, 5, 4, 3, 2, 1].map((i) => (
                <span
                  key={i}
                  className={styles.slab}
                  style={{ "--i": i } as React.CSSProperties}
                />
              ))}
              <span className={styles.face}>
                <img src="/home/lid/lid-closed.svg" alt="" />
                <span className={styles.lidLabel} aria-hidden="true">
                  Email
                </span>
              </span>
            </button>
          </div>
          <p
            className={`${styles.said} ${said ? styles.on : ""}`}
            aria-live="polite"
          >
            {said}
          </p>
        </div>
        <div
          className={`${styles.contact} ${revealed ? styles.on : ""}`}
          aria-live="polite"
        >
          <a className={styles.mail} href={mailto} tabIndex={revealed ? 0 : -1}>
            {revealed ? address() : "neil@··········.com"}
          </a>
          <button
            className={`${styles.copy} ${copied === "Copied" ? styles.copied : ""}`}
            type="button"
            tabIndex={revealed ? 0 : -1}
            aria-label={
              copied === "Copied"
                ? "Email address copied"
                : "Copy email address"
            }
            onClick={copy}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path className={styles.sheets} d="M8 8h11v11H8zM5 16V5h11" />
              <path className={styles.tick} d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </button>
          <span className={styles.note}>{copied}</span>
        </div>
      </div>
      <footer className={`${shell.wrap} ${styles.footer}`}>
        <span>Neil McArdle, 2026</span>
        <div>
          <a href="https://www.linkedin.com/in/neilmcardle/">LinkedIn</a>
          <a href="https://x.com/BetterNeil">X</a>
        </div>
      </footer>
    </section>
  );
}
