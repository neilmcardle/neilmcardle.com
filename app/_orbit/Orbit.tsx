"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { Glyph, type AppIconKey } from "@/app/_home/AppIcon";
import ProductMark from "@/app/_home/ProductMark";
import { MARK_EVENT } from "@/app/_home/intro-script";
import { CLIENTS } from "@/app/_home/data";
import Contact from "./Contact";
import ProfileMark from "./ProfileMark";
import AvisLogo from "@/app/_home/AvisLogo";
import Role from "./Role";
import { FRAGMENT, INK, VERTEX } from "./particles";
import styles from "./orbit.module.css";

export type OrbitMark =
  | "makeebook"
  | "coverly"
  | "doodlewire"
  | "spark"
  | "podium"
  | "speakui"
  | "vectorPaint"
  | "iconAnimator"
  | "promptr"
  | "n"
  | "book"
  | "frame"
  | "kids"
  | "audio"
  | "tools"
  | "avis";

type Preview =
  | { kind: "screen"; src: string }
  | {
      kind: "image";
      src: string;
      width: number;
      height: number;
      logo?: string;
    }
  | { kind: "phones"; srcs: string[] }
  | { kind: "covers"; srcs: string[] }
  | { kind: "paintings"; srcs: string[] };

export type OrbitItem = {
  id: string;
  name: string;
  group: string;
  mark: OrbitMark;
  preview: Preview;
  caption?: string;
};

export const PER_ICON = 1200;
const SAMPLE = 160;
export function Mark({ mark }: { mark: OrbitMark }) {
  if (mark === "avis") return <AvisLogo />;
  if (
    mark === "makeebook" ||
    mark === "coverly" ||
    mark === "doodlewire" ||
    mark === "spark"
  )
    return <ProductMark mark={mark} />;
  if (mark === "vectorPaint" || mark === "iconAnimator" || mark === "promptr")
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Glyph icon={mark} />
      </svg>
    );
  if (mark === "n")
    return (
      <svg viewBox="15 15 33 33" fill="currentColor">
        <path d="M45 45L32 31.2985V18H45V45Z" />
        <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
      </svg>
    );
  if (mark === "speakui")
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <path d="M3.5 10v4M7.75 7v10M12 3.5v17M16.25 7v10M20.5 10v4" />
      </svg>
    );
  if (mark === "book")
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0M3 6v13M12 6v13M21 6v13" />
      </svg>
    );
  if (mark === "kids" || mark === "audio" || mark === "tools")
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d={
            mark === "tools"
              ? "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
              : mark === "kids"
                ? "M4.5 13h6.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1zM13 13h6.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H13a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1zM8.75 4.5h6.5a1 1 0 0 1 1 1v6.5H7.75V5.5a1 1 0 0 1 1-1z"
                : "M3.5 14.5h2.5a2 2 0 0 1 2 2v2.5a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V12a8.5 8.5 0 0 1 17 0v7a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2v-2.5a2 2 0 0 1 2-2h2.5"
          }
        />
      </svg>
    );
  if (mark === "frame")
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      >
        <rect x="3.5" y="3" width="17" height="18" rx="1" />
        <rect x="7" y="6.5" width="10" height="11" />
        <path d="M7 15.5l3-3 2.5 2.5 1.5-1.5 3 3" />
      </svg>
    );
  return (
    <svg viewBox="0 0 64 64" fill="currentColor">
      <image href="/home/podium/mark.png" width="64" height="64" />
    </svg>
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function samplePoints(mark: OrbitMark, svg: SVGSVGElement | null) {
  let img: HTMLImageElement;
  if (mark === "podium") {
    img = await loadImage("/home/podium/mark.png");
  } else {
    if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(SAMPLE));
    clone.setAttribute("height", String(SAMPLE));
    clone.setAttribute("style", "color:#000");
    const markup = new XMLSerializer().serializeToString(clone);
    img = await loadImage(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`,
    );
  }
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE;
  canvas.height = SAMPLE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const ratio = Math.min(SAMPLE / img.width, SAMPLE / img.height);
  const w = img.width * ratio;
  const h = img.height * ratio;
  ctx.drawImage(img, (SAMPLE - w) / 2, (SAMPLE - h) / 2, w, h);
  const data = ctx.getImageData(0, 0, SAMPLE, SAMPLE).data;
  const filled: number[] = [];
  for (let i = 0; i < SAMPLE * SAMPLE; i += 1)
    if (data[i * 4 + 3] > 110) filled.push(i);
  if (!filled.length) return null;
  const points = new Float32Array(PER_ICON * 2);
  for (let k = 0; k < PER_ICON; k += 1) {
    const index = filled[Math.floor(Math.random() * filled.length)];
    points[k * 2] = ((index % SAMPLE) + Math.random()) / SAMPLE - 0.5;
    points[k * 2 + 1] =
      (Math.floor(index / SAMPLE) + Math.random()) / SAMPLE - 0.5;
  }
  return points;
}

type Layout = { cx: number; cy: number; r: number; s: number };

function targetLayout(width: number, height: number, open: boolean): Layout {
  if (open && width >= 900) {
    const free = width - Math.min(760, width - 520);
    const r = Math.max(104, Math.min(280, height * 0.28, free * 0.34));
    const s = Math.max(34, Math.min(76, r * 0.3));
    return {
      cx: Math.max(40 + r + s / 2, free / 2),
      cy: height / 2 + 24,
      r,
      s,
    };
  }
  const room = Math.min(width, height - 170);
  const r = Math.max(118, Math.min(560, room * (room > 700 ? 0.41 : 0.36)));
  const s = Math.max(44, Math.min(132, r * 0.27));
  return { cx: width / 2, cy: height / 2 + 24, r, s };
}

function PreviewView({ item }: { item: OrbitItem }) {
  const p = item.preview;
  if (p.kind === "screen")
    return (
      <span className={styles.screen}>
        <img src={p.src} alt="" loading="lazy" />
      </span>
    );
  if (p.kind === "image")
    return (
      <span className={styles.pictureWrap}>
        <img
          className={styles.picture}
          src={p.src}
          alt=""
          width={p.width}
          height={p.height}
          style={{
            width: `min(100cqw, 100cqh * ${p.width} / ${p.height})`,
            aspectRatio: `${p.width} / ${p.height}`,
          }}
          loading="lazy"
        />
        {p.logo ? (
          <>
            <span className={styles.shade} aria-hidden="true" />
            <img
              className={styles.overlay}
              src={p.logo}
              alt=""
              loading="lazy"
            />
          </>
        ) : null}
      </span>
    );
  if (p.kind === "phones")
    return (
      <span className={`${styles.row} ${styles.phones}`}>
        {p.srcs.map((src) => (
          <span key={src} className={styles.phone}>
            <img src={src} alt="" loading="lazy" />
          </span>
        ))}
      </span>
    );
  if (p.kind === "covers")
    return (
      <span className={styles.fan}>
        {p.srcs.map((src, index) => {
          const side = index - (p.srcs.length - 1) / 2;
          return (
            <span
              key={src}
              className={styles.cover}
              style={{
                transform: `translate(calc(-50% + ${side * 62}%), calc(-50% + ${Math.abs(side) * 6}%)) rotate(${side * 10}deg)`,
                zIndex: 10 - Math.abs(side),
              }}
            >
              <img src={src} alt="" loading="lazy" />
            </span>
          );
        })}
      </span>
    );
  return (
    <span className={`${styles.row} ${styles.wall}`}>
      {p.srcs.map((src) => (
        <span key={src} className={styles.painting}>
          <img src={src} alt="" loading="lazy" />
        </span>
      ))}
    </span>
  );
}

const ALL = -1;

export default function Orbit({
  items,
  panels,
  all,
  hero,
  greet,
}: {
  items: OrbitItem[];
  panels: Record<string, ReactNode>;
  all: ReactNode;
  hero?: string;
  greet?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLButtonElement>(null);
  const allWorkRef = useRef<HTMLButtonElement>(null);
  const belowRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const glyphRefs = useRef<(SVGSVGElement | null)[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pointerType = useRef("mouse");
  const armed = useRef(false);
  const [hot, setHot] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const heroIndex = hero ? items.findIndex((item) => item.id === hero) : -1;
  const lead = heroIndex >= 0 ? heroIndex : null;
  const live = useRef({
    hot: null as number | null,
    active: null as number | null,
    lead: null as number | null,
  });
  const greeting = useRef<number | null>(null);

  useEffect(() => {
    live.current = { hot, active, lead };
  }, [hot, active, lead]);

  useEffect(() => {
    const index = greet ? items.findIndex((item) => item.id === greet) : -1;
    if (index < 0) return;
    let timer = 0;
    const form = () => {
      greeting.current = index;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        greeting.current = null;
      }, 2600);
    };
    window.addEventListener(MARK_EVENT, form);
    return () => {
      window.removeEventListener(MARK_EVENT, form);
      window.clearTimeout(timer);
    };
  }, [greet, items]);

  const open = useCallback(
    (index: number) => {
      const state = window.history.state ?? {};
      if (live.current.active !== null)
        window.history.replaceState(
          { ...state, orbitScroll: panelRef.current?.scrollTop ?? 0 },
          "",
        );
      setActive(index);
      setHot(null);
      const url = new URL(window.location.href);
      url.searchParams.set("work", index === ALL ? "all" : items[index].id);
      window.history.pushState(
        { orbitDepth: (state.orbitDepth ?? 0) + 1, orbitScroll: 0 },
        "",
        url,
      );
      requestAnimationFrame(() => {
        panelRef.current?.scrollTo({ top: 0 });
        panelRef.current?.focus({ preventScroll: true });
      });
    },
    [items],
  );

  const indexFor = useCallback(
    (id: string | null) => {
      if (id === "all") return ALL;
      const index = items.findIndex((item) => item.id === id);
      return index >= 0 ? index : null;
    },
    [items],
  );

  const restore = useCallback(() => {
    const top = window.history.state?.orbitScroll ?? 0;
    requestAnimationFrame(() => panelRef.current?.scrollTo({ top }));
  }, []);

  const close = useCallback(() => {
    const index = live.current.active;
    setActive(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("work");
    window.history.replaceState(null, "", url);
    if (index === ALL) requestAnimationFrame(() => allWorkRef.current?.focus());
    else if (index !== null)
      requestAnimationFrame(() => buttonRefs.current[index]?.focus());
  }, []);

  const back = useCallback(() => {
    if ((window.history.state?.orbitDepth ?? 0) > 0) window.history.back();
    else close();
  }, [close]);

  useEffect(() => {
    const read = () =>
      indexFor(new URLSearchParams(window.location.search).get("work"));
    const index = read();
    if (index !== null) {
      setActive(index);
      restore();
    }
    const onPop = () => {
      const next = read();
      const previous = live.current.active;
      setActive(next);
      setHot(null);
      if (next !== null) restore();
      else if (previous === ALL)
        requestAnimationFrame(() => allWorkRef.current?.focus());
      else if (previous !== null)
        requestAnimationFrame(() => buttonRefs.current[previous]?.focus());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [indexFor, restore]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && live.current.active !== null) back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const count = items.length;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
    const uniforms = {
      uForm: { value: new Array<number>(count).fill(0) },
      uCenter: {
        value: Array.from({ length: count }, () => new THREE.Vector2()),
      },
      uScale: { value: 1 },
      uTime: { value: 0 },
      uDot: { value: 1.7 * dpr },
      uInk: { value: new THREE.Color(INK) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      defines: { COUNT: count },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    let geometry: THREE.BufferGeometry | null = null;
    const form = new Float32Array(count);
    let width = 0;
    let height = 0;
    let layout: Layout | null = null;
    let last = performance.now();
    let frame = 0;
    let cancelled = false;

    Promise.all(
      items.map((item, i) => samplePoints(item.mark, glyphRefs.current[i])),
    ).then((sets) => {
      if (cancelled) return;
      const total = count * PER_ICON;
      const icon = new Float32Array(total);
      const logo = new Float32Array(total * 2);
      const sphere = new Float32Array(total * 3);
      const rnd = new Float32Array(total);
      sets.forEach((set, i) => {
        for (let k = 0; k < PER_ICON; k += 1) {
          const p = i * PER_ICON + k;
          icon[p] = i;
          logo[p * 2] = set ? set[k * 2] : 0;
          logo[p * 2 + 1] = set ? set[k * 2 + 1] : 0;
          const u = Math.random() * 2 - 1;
          const a = Math.random() * Math.PI * 2;
          const ring = Math.sqrt(1 - u * u);
          const shell = 1 - Math.random() * 0.06;
          sphere[p * 3] = ring * Math.cos(a) * shell;
          sphere[p * 3 + 1] = u * shell;
          sphere[p * 3 + 2] = ring * Math.sin(a) * shell;
          rnd[p] = Math.random();
        }
      });
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(total * 3), 3),
      );
      geometry.setAttribute("icon", new THREE.BufferAttribute(icon, 1));
      geometry.setAttribute("logo", new THREE.BufferAttribute(logo, 2));
      geometry.setAttribute("sphere", new THREE.BufferAttribute(sphere, 3));
      geometry.setAttribute("rnd", new THREE.BufferAttribute(rnd, 1));
      const points = new THREE.Points(geometry, material);
      points.frustumCulled = false;
      scene.add(points);
      setReady(true);
    });

    const resize = () => {
      const box = root.getBoundingClientRect();
      width = box.width;
      height = box.height;
      renderer.setSize(width, height, false);
      camera.right = width;
      camera.bottom = height;
      camera.updateProjectionMatrix();
    };
    const sizer = new ResizeObserver(resize);
    sizer.observe(root);
    resize();

    const draw = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!reduced) uniforms.uTime.value += dt;
      const {
        hot: hotIndex,
        active: activeIndex,
        lead: leadIndex,
      } = live.current;
      const target = targetLayout(width, height, activeIndex !== null);
      if (!layout || reduced) layout = { ...target };
      else {
        const k = Math.min(1, dt * 5);
        layout.cx += (target.cx - layout.cx) * k;
        layout.cy += (target.cy - layout.cy) * k;
        layout.r += (target.r - layout.r) * k;
        layout.s += (target.s - layout.s) * k;
      }
      const { cx, cy, r, s } = layout;
      uniforms.uScale.value = s;
      uniforms.uDot.value =
        1.7 * dpr * Math.max(1, Math.min(1.5, Math.sqrt(s / 80)));

      for (let i = 0; i < count; i += 1) {
        const on =
          i === hotIndex ||
          i === activeIndex ||
          (hotIndex === null && activeIndex === null && i === leadIndex) ||
          i === greeting.current
            ? 1
            : 0;
        form[i] = reduced
          ? on
          : form[i] + (on - form[i]) * Math.min(1, dt * 2.6);
        uniforms.uForm.value[i] = form[i];
        const a = -Math.PI / 2 + (i / count) * Math.PI * 2;
        const x0 = cx + Math.cos(a) * r;
        const y0 = cy + Math.sin(a) * r;
        uniforms.uCenter.value[i].set(x0, y0);
        const button = buttonRefs.current[i];
        if (button) {
          button.style.transform = `translate(${x0 - s / 2}px, ${y0 - s / 2}px)`;
          button.style.width = `${s}px`;
          button.style.height = `${s}px`;
        }
      }
      if (geometry) renderer.render(scene, camera);

      const preview = previewRef.current;
      if (preview) {
        const pw = Math.min(r * 1.16, width - 48);
        const ph = pw * 0.7;
        preview.style.width = `${pw}px`;
        preview.style.height = `${ph}px`;
        preview.style.transform = `translate(${cx - pw / 2}px, ${cy - ph / 2}px)`;
        const caption = captionRef.current;
        if (caption) {
          const outside = height - (cy + r + s / 2) >= 120;
          const cw = outside ? Math.min(width - 48, 420) : Math.min(pw, 420);
          const top = outside ? cy + r + s / 2 + 40 : cy + ph / 2 + 16;
          caption.style.width = `${cw}px`;
          caption.style.transform = `translate(${cx - cw / 2}px, ${top}px)`;
        }
      }
      const center = centerRef.current;
      if (center)
        center.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      const below = belowRef.current;
      if (below) {
        const caption = captionRef.current;
        const outside = height - (cy + r + s / 2) >= 120;
        const top =
          outside && caption
            ? cy + r + s / 2 + 40 + caption.offsetHeight + 20
            : Math.min(cy + r + s / 2 + 36, height - 40);
        below.style.transform = `translate(${cx}px, ${top}px) translateX(-50%)`;
      }

      frame = document.hidden ? 0 : requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    const onVisible = () => {
      if (!document.hidden && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      sizer.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      geometry?.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [items]);

  const shown = active === null ? (hot ?? lead) : null;
  const activeItem = active !== null && active !== ALL ? items[active] : null;
  const panelName = active === ALL ? "All work" : activeItem?.name;

  return (
    <div
      ref={rootRef}
      className={styles.orbit}
      data-open={active !== null || undefined}
      data-ready={ready || undefined}
    >
      <header className={styles.top}>
        <h1 className={styles.wordmark}>
          <ProfileMark />
          <span className={styles.identity}>
            <Link
              href="/"
              className={styles.name}
              onClick={() => active !== null && close()}
            >
              Neil McArdle
            </Link>
            <Role />
          </span>
        </h1>
        <Contact />
      </header>

      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      <button
        ref={centerRef}
        type="button"
        className={styles.centerBack}
        onClick={close}
        hidden={active === null}
        aria-label="Close and show the full circle"
        title="Show the full circle"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5" />
        </svg>
      </button>

      <div
        ref={previewRef}
        className={styles.preview}
        aria-hidden="true"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          const { hot, lead: hero, active: current } = live.current;
          const index = hot ?? hero;
          if (index !== null && current === null) open(index);
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className={styles.slide}
            data-on={shown === i || undefined}
          >
            <PreviewView item={item} />
          </div>
        ))}
      </div>

      <div ref={belowRef} className={styles.below}>
        <p className={styles.tagline}>Things I&rsquo;ve said and done</p>
        <button
          ref={allWorkRef}
          type="button"
          className={styles.allWork}
          tabIndex={active === null ? undefined : -1}
          onClick={() => open(ALL)}
        >
          View all work
        </button>
      </div>

      <div ref={captionRef} className={styles.caption} aria-hidden="true">
        {items.map((item, i) =>
          item.caption ? (
            <p
              key={item.id}
              className={styles.captionItem}
              data-on={shown === i || undefined}
            >
              {item.caption}
            </p>
          ) : null,
        )}
      </div>

      <ul className={styles.ring} aria-label="Work">
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              ref={(el) => {
                buttonRefs.current[i] = el;
              }}
              type="button"
              className={styles.node}
              aria-pressed={active === i}
              aria-label={`${item.name}, ${item.group}`}
              data-hot={hot === i || active === i || shown === i || undefined}
              onPointerDown={(event) => {
                pointerType.current = event.pointerType;
                armed.current = live.current.hot === i;
              }}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setHot(i);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse")
                  setHot((current) => (current === i ? null : current));
              }}
              onFocus={() => setHot(i)}
              onBlur={() =>
                setHot((current) => (current === i ? null : current))
              }
              onClick={(event) => {
                if (
                  event.detail > 0 &&
                  pointerType.current !== "mouse" &&
                  active === null &&
                  !armed.current
                ) {
                  setHot(i);
                  return;
                }
                open(i);
              }}
            >
              <span className={styles.glyph} aria-hidden="true">
                <span
                  ref={(el) => {
                    glyphRefs.current[i] = el?.querySelector("svg") ?? null;
                  }}
                >
                  <Mark mark={item.mark} />
                </span>
              </span>
              <span className={styles.label} aria-hidden="true">
                {item.name}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <section
        ref={panelRef}
        className={styles.panel}
        tabIndex={-1}
        aria-label={panelName}
        hidden={active === null}
      >
        <div className={styles.panelBar}>
          <div className={styles.panelLead}>
            <button
              type="button"
              className={styles.panelBack}
              onClick={back}
              aria-label="Back"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </button>
            <p className={styles.eyebrow}>
              {active === ALL ? "All work" : activeItem?.group}
            </p>
          </div>
          {active !== ALL ? (
            <button
              type="button"
              className={styles.allWorkLink}
              onClick={() => open(ALL)}
            >
              View all work
            </button>
          ) : null}
        </div>
        <div className={styles.panelBody}>
          {active === ALL ? all : activeItem ? panels[activeItem.id] : null}
        </div>
      </section>

      <footer className={styles.foot}>
        <ul className={styles.clients} aria-label="Trusted by">
          {CLIENTS.map((client) => (
            <li key={client.name}>
              <img
                src={client.logo}
                alt={client.name}
                style={{ height: client.height * 0.75 }}
              />
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
