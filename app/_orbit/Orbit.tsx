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
import ParticleMark from "@/app/_home/ParticleMark";
import { CLIENTS, EMAIL, LINKEDIN } from "@/app/_home/data";
import { LinkedInIcon } from "@/components/LinkedInIcon";
import home from "@/app/_home/home.module.css";
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
  | "frame";

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
};

const PER_ICON = 1200;
const SAMPLE = 160;
const INK = "#111111";

const VERTEX = `
uniform float uForm[COUNT];
uniform vec2 uCenter[COUNT];
uniform float uScale;
uniform float uTime;
uniform float uDot;
attribute float icon;
attribute vec2 logo;
attribute vec3 sphere;
attribute float rnd;
varying float vAlpha;

vec3 flow(vec3 x, float t) {
  return vec3(
    sin(x.y * 1.7 + t) + sin(x.z * 2.3 - t * 0.7),
    sin(x.z * 1.3 + t * 1.1) + sin(x.x * 2.1 + t * 0.5),
    sin(x.x * 1.9 - t * 0.9) + sin(x.y * 1.1 + t * 0.3)
  ) * 0.5;
}

void main() {
  int i = int(icon + 0.5);
  float f = uForm[i];
  float spin = uTime * 0.12 + icon * 0.9;
  float c = cos(spin);
  float s = sin(spin);
  float spread = 0.3 + 0.7 * pow(fract(rnd * 7.31), 0.7);
  vec3 p = sphere * spread;
  p = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  p += flow(p * 1.2 + icon * 1.7, uTime * 0.2) * 0.3;
  p += flow(vec3(rnd * 6.0, fract(rnd * 3.7) * 4.0, icon), uTime * 0.42) * 0.14;
  p += flow(p * 2.4 - icon, uTime * 0.3) * 0.06;
  float along = clamp(logo.x + 0.5, 0.0, 1.0);
  float k = clamp(f * 1.6 - along * 0.45 - rnd * 0.15, 0.0, 1.0);
  float e = k * k * (3.0 - 2.0 * k);
  vec2 swirl = flow(vec3(logo * 3.0, icon), uTime * 0.8).xy * 0.16 * sin(e * 3.14159);
  vec2 local = mix(p.xy * 0.46, logo, e) + swirl;
  vec2 pos = uCenter[i] + local * uScale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
  float depth = clamp(p.z * 0.5 + 0.5, 0.0, 1.0);
  float haze = (0.2 + 0.42 * depth) * (1.0 - 0.5 * spread * spread);
  gl_PointSize = uDot * mix(0.55 + 0.35 * depth, 0.95, e);
  vAlpha = mix(haze, 0.9, e);
}
`;

const FRAGMENT = `
uniform vec3 uInk;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.28, d) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uInk, a);
}
`;

function Mark({ mark }: { mark: OrbitMark }) {
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

async function samplePoints(mark: OrbitMark, svg: SVGSVGElement | null) {
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
  const room = Math.min(width, height - 120);
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

export default function Orbit({
  items,
  panels,
}: {
  items: OrbitItem[];
  panels: Record<string, ReactNode>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const glyphRefs = useRef<(SVGSVGElement | null)[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pointerType = useRef("mouse");
  const armed = useRef(false);
  const [hot, setHot] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const live = useRef({
    hot: null as number | null,
    active: null as number | null,
  });

  useEffect(() => {
    live.current = { hot, active };
  }, [hot, active]);

  const open = useCallback(
    (index: number) => {
      setActive(index);
      setHot(null);
      const url = new URL(window.location.href);
      url.searchParams.set("work", items[index].id);
      window.history.replaceState(null, "", url);
      requestAnimationFrame(() => {
        panelRef.current?.scrollTo({ top: 0 });
        panelRef.current?.focus({ preventScroll: true });
      });
    },
    [items],
  );

  const close = useCallback(() => {
    const index = live.current.active;
    setActive(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("work");
    window.history.replaceState(null, "", url);
    if (index !== null)
      requestAnimationFrame(() => buttonRefs.current[index]?.focus());
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("work");
    const index = items.findIndex((item) => item.id === id);
    if (index >= 0) setActive(index);
  }, [items]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && live.current.active !== null) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

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
      const { hot: hotIndex, active: activeIndex } = live.current;
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
        const on = i === hotIndex || i === activeIndex ? 1 : 0;
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
      }
      const center = centerRef.current;
      if (center)
        center.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;

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

  const shown = active === null ? hot : null;
  const activeItem = active !== null ? items[active] : null;

  return (
    <div
      ref={rootRef}
      className={styles.orbit}
      data-open={active !== null || undefined}
      data-ready={ready || undefined}
    >
      <header className={styles.top}>
        <h1 className={styles.wordmark}>
          <span className={home.mark} data-home-mark>
            <ParticleMark spin />
          </span>
          <Link href="/" onClick={() => active !== null && close()}>
            <span className={styles.name}>Neil McArdle</span>{" "}
            <span className={styles.role}>
              Senior Digital Product Designer, London, UK
            </span>
          </Link>
        </h1>
        <nav className={styles.contact} aria-label="Contact">
          <a
            href="https://x.com/BetterNeil"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="@BetterNeil on X (opens in a new tab)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Neil McArdle on LinkedIn (opens in a new tab)"
          >
            <LinkedInIcon aria-hidden="true" />
          </a>
          <a href={`mailto:${EMAIL}`} aria-label={`Email ${EMAIL}`}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2.5" />
              <path d="M3.5 7l8.5 6 8.5-6" />
            </svg>
          </a>
        </nav>
      </header>

      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      <button
        ref={centerRef}
        type="button"
        className={styles.centerBack}
        onClick={close}
        hidden={active === null}
        aria-label="Back to all work"
        title="Back to all work"
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

      <div ref={previewRef} className={styles.preview} aria-hidden="true">
        <p className={styles.idle} data-on={shown === null || undefined}>
          Things I&rsquo;ve said and done
        </p>
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
              data-hot={hot === i || active === i || undefined}
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
        aria-label={activeItem ? activeItem.name : undefined}
        hidden={active === null}
      >
        <div className={styles.panelBar}>
          <p className={styles.eyebrow}>{activeItem?.group}</p>
          <button
            type="button"
            className={`${styles.back} ${styles.panelBack}`}
            onClick={close}
          >
            Back to all work
          </button>
        </div>
        <div className={styles.panelBody}>
          {activeItem ? panels[activeItem.id] : null}
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
