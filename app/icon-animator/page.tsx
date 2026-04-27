"use client";

// Icon Animator — vertical scrolling workshop in Promptr's design language.
//
// Layout grammar mirrors Promptr: cream background, 48px sticky header
// (back arrow + dot + tool name), Zilla Slab wordmark hero with Playfair
// italic subtitle, white cards (16px radius, soft shadow) on cream,
// inline-styled throughout so the design language matches the other
// portfolio tools without a component system.
//
// All animation logic (keyframes, shadow filters, output generators,
// SVG sanitiser) is unchanged — only the UI layer has been rebuilt.
// The Leva floating panel has been replaced with native React controls
// that live inside an editorial card, organised into Animation, Motion,
// Appearance, Shadow, and Advanced groups.

import { useState, useRef, useCallback, ReactNode } from "react";
import Link from "next/link";

// ─── Icon library ────────────────────────────────────────────────────────────
type IconDef = { id: string; name: string; el: React.ReactNode };

const ICONS: IconDef[] = [
  { id: "zap",         name: "Zap",         el: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /> },
  { id: "heart",       name: "Heart",       el: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /> },
  { id: "star",        name: "Star",        el: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /> },
  { id: "bell",        name: "Bell",        el: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></> },
  { id: "search",      name: "Search",      el: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></> },
  { id: "send",        name: "Send",        el: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></> },
  { id: "arrow-up",    name: "Arrow Up",    el: <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></> },
  { id: "arrow-right", name: "Arrow Right", el: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></> },
  { id: "check",       name: "Check",       el: <polyline points="20 6 9 17 4 12" /> },
  { id: "close",       name: "Close",       el: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> },
  { id: "play",        name: "Play",        el: <polygon points="5 3 19 12 5 21 5 3" /> },
  { id: "download",    name: "Download",    el: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></> },
  { id: "lock",        name: "Lock",        el: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
  { id: "mail",        name: "Mail",        el: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></> },
  { id: "user",        name: "User",        el: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
  { id: "home",        name: "Home",        el: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
  { id: "moon",        name: "Moon",        el: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /> },
  { id: "sun",         name: "Sun",         el: <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></> },
  { id: "sparkles",    name: "Sparkles",    el: <><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" /><path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75L5 3z" /><path d="M19 16l.75 2.25L22 19l-2.25.75L19 22l-.75-2.25L16 19l2.25-.75L19 16z" /></> },
  { id: "settings",    name: "Settings",    el: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
];

// ─── Dynamic keyframe generator ──────────────────────────────────────────────
function makeKeyframes(preset: string, travel: number, scale: number): string {
  const d = travel.toFixed(1);
  const s = scale.toFixed(3);
  const sm = (1 + (scale - 1) * 0.25).toFixed(3);
  const sm2 = (1 + (scale - 1) * 0.8).toFixed(3);
  switch (preset) {
    case "bounce":    return `@keyframes ia-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-${d}px)}}`;
    case "spin":      return `@keyframes ia-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`;
    case "pulse":     return `@keyframes ia-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(${s});opacity:.7}}`;
    case "wiggle":    return `@keyframes ia-wiggle{0%,100%{transform:rotate(0)}15%{transform:rotate(-14deg)}30%{transform:rotate(14deg)}45%{transform:rotate(-9deg)}60%{transform:rotate(9deg)}75%{transform:rotate(-4deg)}90%{transform:rotate(4deg)}}`;
    case "pop":       return `@keyframes ia-pop{0%{transform:scale(1)}40%{transform:scale(${s})}65%{transform:scale(.9)}80%{transform:scale(${sm})}100%{transform:scale(1)}}`;
    case "shake":     return `@keyframes ia-shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-${(travel * 0.5).toFixed(1)}px) rotate(-3deg)}30%{transform:translateX(${(travel * 0.44).toFixed(1)}px) rotate(3deg)}45%{transform:translateX(-${(travel * 0.31).toFixed(1)}px)}60%{transform:translateX(${(travel * 0.25).toFixed(1)}px)}75%{transform:translateX(-${(travel * 0.125).toFixed(1)}px)}}`;
    case "float":     return `@keyframes ia-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-${(travel * 0.625).toFixed(1)}px)}}`;
    case "heartbeat": return `@keyframes ia-heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(${s})}28%{transform:scale(1)}42%{transform:scale(${sm2})}70%{transform:scale(1)}}`;
    case "blink":     return `@keyframes ia-blink{0%,100%{opacity:1}50%{opacity:0}}`;
    case "swing":     return `@keyframes ia-swing{0%,100%{transform:rotate(0)}20%{transform:rotate(20deg)}40%{transform:rotate(-16deg)}60%{transform:rotate(10deg)}80%{transform:rotate(-6deg)}}`;
    case "draw":      return `@keyframes ia-draw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}`;
    default:          return "";
  }
}

const ORIGIN_POINTS = [
  { id: "tl", css: "0% 0%",    label: "Top Left"     },
  { id: "tc", css: "50% 0%",   label: "Top"          },
  { id: "tr", css: "100% 0%",  label: "Top Right"    },
  { id: "ml", css: "0% 50%",   label: "Left"         },
  { id: "mc", css: "50% 50%",  label: "Center"       },
  { id: "mr", css: "100% 50%", label: "Right"        },
  { id: "bl", css: "0% 100%",  label: "Bottom Left"  },
  { id: "bc", css: "50% 100%", label: "Bottom"       },
  { id: "br", css: "100% 100%",label: "Bottom Right" },
];

// ─── Shadow helpers ──────────────────────────────────────────────────────────
function hexToRgb(hex: string): string | null {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}` : null;
}

function makeShadowFilter(preset: string, color: string, opacity: number): string {
  const c = hexToRgb(color);
  if (!c) return "none";
  const a = (m: number) => `rgba(${c},${Math.min(1, opacity * m).toFixed(3)})`;
  switch (preset) {
    case "soft":   return `drop-shadow(0 1px 1px ${a(1)}) drop-shadow(0 2px 4px ${a(0.8)}) drop-shadow(0 4px 8px ${a(0.5)})`;
    case "dreamy": return `drop-shadow(0 2px 6px ${a(0.6)}) drop-shadow(0 6px 16px ${a(0.9)}) drop-shadow(0 12px 32px ${a(0.45)})`;
    case "sharp":  return `drop-shadow(0 1px 2px ${a(1.2)}) drop-shadow(0 2px 4px ${a(0.9)}) drop-shadow(0 1px 1px ${a(0.5)})`;
    case "long":   return `drop-shadow(2px 2px 1px ${a(0.9)}) drop-shadow(4px 4px 2px ${a(0.5)}) drop-shadow(8px 8px 4px ${a(0.25)})`;
    default:       return "none";
  }
}

// ─── Output generators ───────────────────────────────────────────────────────
type BuildParams = {
  preset: string; duration: number; delay: number; iterations: string;
  direction: string; fillMode: string; easing: string; color: string;
  stroked: boolean; strokeWidth: number; strokeCap: string; strokeJoin: string;
  filled: boolean; fillColor: string; transformOrigin: string;
  travel: number; scale: number; shadowFilter: string;
};

function buildCSS(p: BuildParams): string {
  const timing = p.preset === "spin" ? "linear" : p.easing;
  const kf = makeKeyframes(p.preset, p.travel, p.scale)
    .replace(/\}\{/g, "} {")
    .replace(/\{/g, " {\n  ")
    .replace(/\}/g, "\n}")
    .replace(/;/g, ";\n  ")
    .replace(/,/g, ",\n  ")
    .replace(/  \n}/g, "\n}")
    .trim();
  const delayStr = p.delay > 0 ? ` ${p.delay}s` : "";
  const iterStr  = p.iterations !== "infinite" ? ` ${p.iterations}` : " infinite";
  const dirStr   = p.direction !== "normal" ? ` ${p.direction}` : "";
  const fillStr  = p.fillMode !== "none" ? ` ${p.fillMode}` : "";
  const strokeLines = p.stroked
    ? [`  stroke-width: ${p.strokeWidth};`, `  stroke-linecap: ${p.strokeCap};`, `  stroke-linejoin: ${p.strokeJoin};`]
    : [`  stroke: none;`];
  const drawLines = p.preset === "draw" && p.stroked ? [`  stroke-dasharray: 1000;`, `  stroke-dashoffset: 1000;`] : [];
  const shadowLine = p.shadowFilter !== "none" ? [`  filter: ${p.shadowFilter};`] : [];
  return [
    kf, "",
    ".icon {",
    `  color: ${p.color};`,
    `  fill: ${p.filled ? p.fillColor : "none"};`,
    ...strokeLines,
    ...drawLines,
    `  transform-origin: ${p.transformOrigin};`,
    ...shadowLine,
    `  animation: ia-${p.preset} ${p.duration}s ${timing}${delayStr}${iterStr}${dirStr}${fillStr};`,
    "}",
  ].join("\n");
}

function buildReact(p: BuildParams): string {
  const timing = p.preset === "spin" ? "linear" : p.easing;
  const delayStr = p.delay > 0 ? `${p.delay}s ` : "";
  const iterStr  = p.iterations !== "infinite" ? `${p.iterations} ` : "infinite ";
  const dirStr   = p.direction !== "normal" ? `${p.direction} ` : "";
  const fillStr  = p.fillMode !== "none" ? p.fillMode : "";
  const strokeLines = p.stroked
    ? [`  strokeWidth: ${p.strokeWidth},`, `  strokeLinecap: "${p.strokeCap}",`, `  strokeLinejoin: "${p.strokeJoin}",`]
    : [`  stroke: "none",`];
  const drawLines = p.preset === "draw" && p.stroked ? [`  strokeDasharray: 1000,`, `  strokeDashoffset: 1000,`] : [];
  const shadowLine = p.shadowFilter !== "none" ? [`  filter: "${p.shadowFilter}",`] : [];
  return [
    `"use client";`,
    ``,
    `const keyframes = \``,
    makeKeyframes(p.preset, p.travel, p.scale),
    `\`;`,
    ``,
    `const style: React.CSSProperties = {`,
    `  color: "${p.color}",`,
    `  fill: "${p.filled ? p.fillColor : "none"}",`,
    ...strokeLines,
    ...drawLines,
    `  transformOrigin: "${p.transformOrigin}",`,
    ...shadowLine,
    `  animation: \`ia-${p.preset} ${p.duration}s ${timing} ${delayStr}${iterStr}${dirStr}${fillStr}\`.trim(),`,
    `};`,
    ``,
    `export function AnimatedIcon({ size = 24 }: { size?: number }) {`,
    `  return (`,
    `    <>`,
    `      <style>{keyframes}</style>`,
    `      <svg`,
    `        viewBox="0 0 24 24"`,
    `        width={size}`,
    `        height={size}`,
    `        stroke="currentColor"`,
    `        style={style}`,
    `      >`,
    `        {/* paste your icon paths here */}`,
    `      </svg>`,
    `    </>`,
    `  );`,
    `}`,
  ].join("\n");
}

// ─── SVG sanitiser ───────────────────────────────────────────────────────────
const ALLOWED = new Set(["path","circle","rect","polygon","polyline","line","ellipse","g","defs","use","symbol"]);

function sanitiseSVG(raw: string): { viewBox: string; inner: string } | null {
  if (typeof window === "undefined") return null;
  const doc = new DOMParser().parseFromString(raw, "image/svg+xml");
  if (doc.querySelector("parsererror")) return null;
  const svg = doc.querySelector("svg");
  if (!svg) return null;
  svg.querySelectorAll("*").forEach(el => { if (!ALLOWED.has(el.tagName.toLowerCase())) el.remove(); });
  return { viewBox: svg.getAttribute("viewBox") ?? "0 0 24 24", inner: svg.innerHTML };
}

// ─── UI primitives in Promptr's design language ──────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.65)" }}>
          {label}
        </span>
        {hint && (
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "rgba(0,0,0,0.4)", fontVariantNumeric: "tabular-nums" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Select<T extends string>({ value, onChange, options }: {
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      style={{
        width: "100%",
        fontFamily: "var(--font-inter)",
        fontSize: 13,
        padding: "8px 10px",
        background: "rgba(0,0,0,0.03)",
        border: "1px solid transparent",
        borderRadius: 8,
        color: "rgba(0,0,0,0.78)",
        cursor: "pointer",
        outline: "none",
        appearance: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(0,0,0,0.4)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 28,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Slider({ value, onChange, min, max, step }: {
  value: number; onChange: (v: number) => void; min: number; max: number; step: number;
}) {
  return (
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      min={min}
      max={max}
      step={step}
      style={{
        width: "100%",
        accentColor: "#111",
        cursor: "pointer",
      }}
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: "var(--font-inter)",
        fontSize: 12,
        fontWeight: 500,
        color: "rgba(0,0,0,0.65)",
      }}
    >
      <span>{label}</span>
      <span
        style={{
          width: 32,
          height: 18,
          borderRadius: 9,
          background: checked ? "#111" : "rgba(0,0,0,0.12)",
          position: "relative",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 16 : 2,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.15s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }}
        />
      </span>
    </button>
  );
}

function ColorSwatch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        padding: "6px 10px",
        background: "rgba(0,0,0,0.03)",
        borderRadius: 8,
        fontFamily: "var(--font-inter)",
        fontSize: 12,
        color: "rgba(0,0,0,0.65)",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          background: value,
          border: "1px solid rgba(0,0,0,0.1)",
          flexShrink: 0,
        }}
      />
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{value.toUpperCase()}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
    </label>
  );
}

function OriginPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,20px)", gap: 4 }}>
      {ORIGIN_POINTS.map(pt => (
        <button
          key={pt.id}
          title={pt.label}
          onClick={() => onChange(pt.css)}
          style={{
            width: 20, height: 20, borderRadius: 4, border: "none", cursor: "pointer",
            background: value === pt.css ? "#111" : "rgba(0,0,0,0.08)",
            transition: "background 0.15s",
          }}
        />
      ))}
    </div>
  );
}

function Disclosure({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 0",
          background: "transparent",
          border: "none",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 11,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(0,0,0,0.45)",
          }}
        >
          {title}
        </span>
        <svg
          width="10" height="6" viewBox="0 0 10 6" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
        >
          <path d="M1 1l4 4 4-4" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0 16px" }}>{children}</div>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
const TRAVEL_PRESETS = ["bounce", "shake", "float"];
const SCALE_PRESETS = ["pulse", "pop", "heartbeat"];

export default function IconAnimator() {
  // Animation
  const [preset, setPreset] = useState("bounce");
  const [duration, setDuration] = useState(1.2);
  const [delay, setDelay] = useState(0);
  const [iterations, setIterations] = useState("infinite");
  const [easing, setEasing] = useState("ease-in-out");
  const [travel, setTravel] = useState(16);
  const [scale, setScale] = useState(1.25);
  const [direction, setDirection] = useState("normal");
  const [fillMode, setFillMode] = useState("none");

  // Appearance
  const [color, setColor] = useState("#111111");
  const [stroked, setStroked] = useState(true);
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [strokeCap, setStrokeCap] = useState("round");
  const [strokeJoin, setStrokeJoin] = useState("round");
  const [filled, setFilled] = useState(false);
  const [fillColor, setFillColor] = useState("#111111");
  const [iconSize, setIconSize] = useState(64);
  const [previewBg, setPreviewBg] = useState("#ffffff");

  // Shadow
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowPreset, setShadowPreset] = useState("soft");
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowOpacity, setShadowOpacity] = useState(0.12);

  // Icon + UI
  const [iconId, setIconId] = useState("zap");
  const [customIcon, setCustomIcon] = useState<{ viewBox: string; inner: string } | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [origin, setOrigin] = useState("50% 50%");
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [format, setFormat] = useState<"css" | "react">("css");
  const [shadowOpen, setShadowOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const icon = customIcon ? null : (ICONS.find(i => i.id === iconId) ?? ICONS[0]);
  const timing  = preset === "spin" ? "linear" : easing;
  const kf      = makeKeyframes(preset, travel, scale);
  const delayStr = delay > 0 ? ` ${delay}s` : "";
  const iterStr  = iterations !== "infinite" ? ` ${iterations}` : " infinite";
  const dirStr   = direction !== "normal" ? ` ${direction}` : "";
  const fillStr  = fillMode !== "none" ? ` ${fillMode}` : "";

  const shadowFilter = shadowEnabled ? makeShadowFilter(shadowPreset, shadowColor, shadowOpacity) : "none";
  const animKey = `${preset}-${duration}-${delay}-${iterations}-${direction}-${fillMode}-${easing}-${resetKey}`;

  const animStyle: React.CSSProperties = {
    animation: `ia-${preset} ${duration}s ${timing}${delayStr}${iterStr}${dirStr}${fillStr}`,
    animationPlayState: playing ? "running" : "paused",
    transformOrigin: origin,
    ...(shadowFilter !== "none" ? { filter: shadowFilter } : {}),
    ...(preset === "draw" && stroked ? { strokeDasharray: 1000, strokeDashoffset: 1000 } : {}),
  };

  const params: BuildParams = { preset, duration, delay, iterations, direction, fillMode, easing, color, stroked, strokeWidth, strokeCap, strokeJoin, filled, fillColor, transformOrigin: origin, travel, scale, shadowFilter };
  const output = format === "react" ? buildReact(params) : buildCSS(params);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = sanitiseSVG(ev.target?.result as string);
      if (result) { setCustomIcon(result); setIconId("__custom__"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const handlePaste = () => {
    const result = sanitiseSVG(pasteValue);
    if (!result) { setPasteError("Invalid SVG — check the markup and try again."); return; }
    setCustomIcon(result); setIconId("__custom__");
    setPasteOpen(false); setPasteValue(""); setPasteError("");
  };

  const svgShared = {
    fill: filled ? fillColor : "none",
    stroke: stroked ? color : "none",
    strokeLinecap: strokeCap as "round" | "butt" | "square",
    strokeLinejoin: strokeJoin as "round" | "miter" | "bevel",
    strokeWidth: stroked ? strokeWidth : 0,
  };

  const showTravel = TRAVEL_PRESETS.includes(preset);
  const showScale = SCALE_PRESETS.includes(preset);

  return (
    <>
      <style>{kf}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "#f8f8f7",
          fontFamily: "var(--font-inter)",
        }}
      >
        {/* ─── Header ─────────────────────────────────────────────────── */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            height: 48,
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            background: "rgba(248,248,247,0.92)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/"
              style={{
                color: "rgba(0,0,0,0.3)",
                display: "flex",
                transition: "color 0.15s",
              }}
              aria-label="Back to neilmcardle.com"
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(0,0,0,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(0,0,0,0.3)")}
            >
              <svg
                width="14" height="14" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
            <span style={{ color: "rgba(0,0,0,0.12)" }}>·</span>
            <span
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(0,0,0,0.7)",
                letterSpacing: "-0.01em",
              }}
            >
              Icon Animator
            </span>
          </div>
        </header>

        {/* ─── Body ───────────────────────────────────────────────────── */}
        <main>

          {/* ─── Hero ─────────────────────────────────────────────────── */}
          <section
            style={{
              padding: "64px 24px 40px",
              maxWidth: 860,
              margin: "0 auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 320px", minWidth: 0 }}>
                <h1
                  style={{
                    fontFamily: "var(--font-zilla-slab)",
                    fontWeight: 700,
                    fontSize: "clamp(40px, 6.5vw, 80px)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.03em",
                    color: "rgba(0,0,0,0.92)",
                    margin: 0,
                    overflowWrap: "break-word",
                    hyphens: "auto",
                  }}
                >
                  Icon Animator
                </h1>
                <p
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontWeight: 400,
                    fontSize: "clamp(20px, 2.8vw, 28px)",
                    lineHeight: 1.2,
                    letterSpacing: "-0.015em",
                    color: "rgba(0,0,0,0.6)",
                    marginTop: 16,
                    marginBottom: 0,
                    fontStyle: "italic",
                  }}
                >
                  A small workshop for moving icons.
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "rgba(0,0,0,0.55)",
                    marginTop: 18,
                    marginBottom: 0,
                    maxWidth: 480,
                  }}
                >
                  Pick a preset, tune the timing, paste your own SVG. Copy the CSS or React snippet when it feels right.
                </p>
              </div>

              <div
                style={{
                  flex: "0 0 auto",
                  width: "clamp(240px, 38vw, 360px)",
                }}
              >
                <img
                  src="/icon-animator.png"
                  alt="Icon Animator"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: 16,
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.18)",
                  }}
                />
              </div>
            </div>
          </section>

          {/* ─── Library ──────────────────────────────────────────────── */}
          <section style={{ padding: "32px 24px", maxWidth: 860, margin: "0 auto" }}>
            <div style={{ marginBottom: 16 }}>
              <h2
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontWeight: 400,
                  fontSize: 24,
                  letterSpacing: "-0.015em",
                  color: "rgba(0,0,0,0.85)",
                  margin: "0 0 6px",
                }}
              >
                Pick an icon
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 14,
                  color: "rgba(0,0,0,0.5)",
                  margin: 0,
                }}
              >
                Twenty Feather-style essentials, or bring your own SVG.
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 0 0 1px rgba(0,0,0,0.02), 0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* Custom SVG row */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 16,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.1)",
                    background: "#fff",
                    color: "rgba(0,0,0,0.75)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  Upload SVG
                </button>
                <button
                  onClick={() => setPasteOpen(v => !v)}
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: pasteOpen ? "none" : "1px solid rgba(0,0,0,0.1)",
                    background: pasteOpen ? "#111" : "#fff",
                    color: pasteOpen ? "#fff" : "rgba(0,0,0,0.75)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {pasteOpen ? "Close paste" : "Paste SVG"}
                </button>
                {customIcon && (
                  <button
                    onClick={() => setIconId("__custom__")}
                    title="Loaded custom SVG"
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: iconId === "__custom__" ? "none" : "1px solid rgba(0,0,0,0.08)",
                      cursor: "pointer",
                      background: iconId === "__custom__" ? "#111" : "#fff",
                      color: iconId === "__custom__" ? "#fff" : "rgba(0,0,0,0.55)",
                      marginLeft: "auto",
                    }}
                  >
                    <svg
                      viewBox={customIcon.viewBox}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: 18, height: 18 }}
                      dangerouslySetInnerHTML={{ __html: customIcon.inner }}
                    />
                  </button>
                )}
              </div>

              {pasteOpen && (
                <div style={{ marginBottom: 16 }}>
                  <textarea
                    value={pasteValue}
                    onChange={e => { setPasteValue(e.target.value); setPasteError(""); }}
                    placeholder="<svg viewBox='0 0 24 24'>…</svg>"
                    rows={4}
                    style={{
                      width: "100%",
                      fontSize: 12,
                      padding: 12,
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(0,0,0,0.02)",
                      color: "rgba(0,0,0,0.75)",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {pasteError && (
                    <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#c53030", marginTop: 6 }}>
                      {pasteError}
                    </p>
                  )}
                  <button
                    onClick={handlePaste}
                    style={{
                      marginTop: 8,
                      fontFamily: "var(--font-inter)",
                      fontSize: 13,
                      fontWeight: 500,
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: "none",
                      background: "#111",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Apply SVG
                  </button>
                </div>
              )}

              {/* Icon grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))",
                  gap: 6,
                }}
              >
                {ICONS.map(ic => {
                  const active = iconId === ic.id && !customIcon;
                  return (
                    <button
                      key={ic.id}
                      title={ic.name}
                      onClick={() => { setIconId(ic.id); setCustomIcon(null); }}
                      style={{
                        aspectRatio: "1 / 1",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        background: active ? "#111" : "transparent",
                        color: active ? "#fff" : "rgba(0,0,0,0.5)",
                      }}
                      onMouseEnter={e => {
                        if (!active) e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                      }}
                      onMouseLeave={e => {
                        if (!active) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: 20, height: 20, strokeWidth: 1.5 }}
                      >
                        {ic.el}
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ─── Workshop ─────────────────────────────────────────────── */}
          <section style={{ padding: "32px 24px 24px", maxWidth: 860, margin: "0 auto" }}>
            <div style={{ marginBottom: 16 }}>
              <h2
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontWeight: 400,
                  fontSize: 24,
                  letterSpacing: "-0.015em",
                  color: "rgba(0,0,0,0.85)",
                  margin: "0 0 6px",
                }}
              >
                Refine
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 14,
                  color: "rgba(0,0,0,0.5)",
                  margin: 0,
                }}
              >
                Tune the motion, the look, and the timing until it feels right.
              </p>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.02), 0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(260px, 360px) 1fr",
                  gap: 0,
                }}
              >
                {/* Preview column */}
                <div
                  style={{
                    padding: 24,
                    borderRight: "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      maxWidth: 240,
                      borderRadius: 20,
                      background: previewBg,
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 0 0 1px rgba(0,0,0,0.02), 0 1px 4px rgba(0,0,0,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.2s",
                    }}
                  >
                    {customIcon ? (
                      <svg
                        key={animKey}
                        viewBox={customIcon.viewBox}
                        {...svgShared}
                        style={{ width: iconSize, height: iconSize, ...animStyle }}
                        dangerouslySetInnerHTML={{ __html: customIcon.inner }}
                      />
                    ) : (
                      <svg
                        key={animKey}
                        viewBox="0 0 24 24"
                        {...svgShared}
                        style={{ width: iconSize, height: iconSize, ...animStyle }}
                      >
                        {icon?.el}
                      </svg>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setPlaying(p => !p)}
                      title={playing ? "Pause" : "Play"}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 36, height: 36, borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.1)", cursor: "pointer",
                        background: "#fff", color: "rgba(0,0,0,0.65)",
                        transition: "all 0.15s",
                      }}
                    >
                      {playing
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="3" width="5" height="18" rx="1" /><rect x="14" y="3" width="5" height="18" rx="1" /></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      }
                    </button>
                    <button
                      onClick={() => { setPlaying(false); setResetKey(k => k + 1); }}
                      title="Reset"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 36, height: 36, borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.1)", cursor: "pointer",
                        background: "#fff", color: "rgba(0,0,0,0.65)",
                        transition: "all 0.15s",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </button>
                  </div>

                  {/* Origin picker */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: 11,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "rgba(0,0,0,0.45)",
                      }}
                    >
                      Transform origin
                    </span>
                    <OriginPicker value={origin} onChange={setOrigin} />
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "rgba(0,0,0,0.4)" }}>
                      {ORIGIN_POINTS.find(p => p.css === origin)?.label ?? origin}
                    </span>
                  </div>
                </div>

                {/* Controls column */}
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="Animation">
                    <Select
                      value={preset}
                      onChange={setPreset}
                      options={[
                        { label: "Bounce",    value: "bounce" },
                        { label: "Spin",      value: "spin" },
                        { label: "Pulse",     value: "pulse" },
                        { label: "Wiggle",    value: "wiggle" },
                        { label: "Pop",       value: "pop" },
                        { label: "Shake",     value: "shake" },
                        { label: "Float",     value: "float" },
                        { label: "Heartbeat", value: "heartbeat" },
                        { label: "Blink",     value: "blink" },
                        { label: "Swing",     value: "swing" },
                        { label: "Draw",      value: "draw" },
                      ]}
                    />
                  </Field>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="Duration" hint={`${duration.toFixed(2)}s`}>
                      <Slider value={duration} onChange={setDuration} min={0.1} max={5} step={0.05} />
                    </Field>
                    <Field label="Delay" hint={`${delay.toFixed(2)}s`}>
                      <Slider value={delay} onChange={setDelay} min={0} max={3} step={0.05} />
                    </Field>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="Repeat">
                      <Select
                        value={iterations}
                        onChange={setIterations}
                        options={[
                          { label: "1×", value: "1" },
                          { label: "2×", value: "2" },
                          { label: "3×", value: "3" },
                          { label: "5×", value: "5" },
                          { label: "Infinite", value: "infinite" },
                        ]}
                      />
                    </Field>
                    <Field label="Easing">
                      <Select
                        value={easing}
                        onChange={setEasing}
                        options={[
                          { label: "Ease",        value: "ease" },
                          { label: "Ease In",     value: "ease-in" },
                          { label: "Ease Out",    value: "ease-out" },
                          { label: "Ease In Out", value: "ease-in-out" },
                          { label: "Linear",      value: "linear" },
                          { label: "Spring",      value: "cubic-bezier(0.34,1.56,0.64,1)" },
                        ]}
                      />
                    </Field>
                  </div>

                  {showTravel && (
                    <Field label="Distance" hint={`${travel}px`}>
                      <Slider value={travel} onChange={setTravel} min={2} max={48} step={1} />
                    </Field>
                  )}
                  {showScale && (
                    <Field label="Scale" hint={`${scale.toFixed(2)}×`}>
                      <Slider value={scale} onChange={setScale} min={1.02} max={2.5} step={0.01} />
                    </Field>
                  )}

                  {/* Appearance */}
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: 11,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "rgba(0,0,0,0.45)",
                      }}
                    >
                      Appearance
                    </span>

                    <Toggle checked={stroked} onChange={setStroked} label="Stroke" />
                    {stroked && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <Field label="Stroke colour">
                          <ColorSwatch value={color} onChange={setColor} />
                        </Field>
                        <Field label="Stroke width" hint={`${strokeWidth}`}>
                          <Slider value={strokeWidth} onChange={setStrokeWidth} min={0.25} max={4} step={0.25} />
                        </Field>
                      </div>
                    )}

                    <Toggle checked={filled} onChange={setFilled} label="Fill" />
                    {filled && (
                      <Field label="Fill colour">
                        <ColorSwatch value={fillColor} onChange={setFillColor} />
                      </Field>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <Field label="Icon size" hint={`${iconSize}px`}>
                        <Slider value={iconSize} onChange={setIconSize} min={16} max={128} step={4} />
                      </Field>
                      <Field label="Background">
                        <ColorSwatch value={previewBg} onChange={setPreviewBg} />
                      </Field>
                    </div>
                  </div>

                  {/* Shadow */}
                  <Disclosure title="Shadow" open={shadowOpen} onToggle={() => setShadowOpen(o => !o)}>
                    <Toggle checked={shadowEnabled} onChange={setShadowEnabled} label="Enable shadow" />
                    {shadowEnabled && (
                      <>
                        <Field label="Style">
                          <Select
                            value={shadowPreset}
                            onChange={setShadowPreset}
                            options={[
                              { label: "Soft",   value: "soft" },
                              { label: "Dreamy", value: "dreamy" },
                              { label: "Sharp",  value: "sharp" },
                              { label: "Long",   value: "long" },
                            ]}
                          />
                        </Field>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <Field label="Colour">
                            <ColorSwatch value={shadowColor} onChange={setShadowColor} />
                          </Field>
                          <Field label="Opacity" hint={shadowOpacity.toFixed(2)}>
                            <Slider value={shadowOpacity} onChange={setShadowOpacity} min={0.02} max={0.5} step={0.01} />
                          </Field>
                        </div>
                      </>
                    )}
                  </Disclosure>

                  {/* Advanced */}
                  <Disclosure title="Advanced" open={advancedOpen} onToggle={() => setAdvancedOpen(o => !o)}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <Field label="Direction">
                        <Select
                          value={direction}
                          onChange={setDirection}
                          options={[
                            { label: "Normal",      value: "normal" },
                            { label: "Reverse",     value: "reverse" },
                            { label: "Alternate",   value: "alternate" },
                            { label: "Alt Reverse", value: "alternate-reverse" },
                          ]}
                        />
                      </Field>
                      <Field label="Fill mode">
                        <Select
                          value={fillMode}
                          onChange={setFillMode}
                          options={[
                            { label: "None",      value: "none" },
                            { label: "Forwards",  value: "forwards" },
                            { label: "Backwards", value: "backwards" },
                            { label: "Both",      value: "both" },
                          ]}
                        />
                      </Field>
                    </div>
                    {stroked && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <Field label="Stroke cap">
                          <Select
                            value={strokeCap}
                            onChange={setStrokeCap}
                            options={[
                              { label: "Round",  value: "round" },
                              { label: "Square", value: "square" },
                              { label: "Butt",   value: "butt" },
                            ]}
                          />
                        </Field>
                        <Field label="Stroke join">
                          <Select
                            value={strokeJoin}
                            onChange={setStrokeJoin}
                            options={[
                              { label: "Round", value: "round" },
                              { label: "Miter", value: "miter" },
                              { label: "Bevel", value: "bevel" },
                            ]}
                          />
                        </Field>
                      </div>
                    )}
                  </Disclosure>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Code ─────────────────────────────────────────────────── */}
          <section style={{ padding: "32px 24px", maxWidth: 860, margin: "0 auto" }}>
            <div style={{ marginBottom: 16 }}>
              <h2
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontWeight: 400,
                  fontSize: 24,
                  letterSpacing: "-0.015em",
                  color: "rgba(0,0,0,0.85)",
                  margin: "0 0 6px",
                }}
              >
                Copy the code
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 14,
                  color: "rgba(0,0,0,0.5)",
                  margin: 0,
                }}
              >
                Grab the CSS or React snippet and drop it into your project.
              </p>
            </div>
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.02), 0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {(["css","react"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      color: format === f ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.3)",
                      fontWeight: format === f ? 600 : 500,
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      padding: 0,
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "18px 20px",
                  fontSize: 12,
                  lineHeight: 1.7,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  color: "rgba(0,0,0,0.7)",
                  overflowX: "auto",
                  whiteSpace: "pre",
                  maxHeight: 320,
                  overflowY: "auto",
                }}
              >
                {output}
              </pre>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "rgba(0,0,0,0.4)" }}>
                  {format === "css" ? "Plain CSS — drop into any stylesheet." : "React component — paste your icon paths."}
                </span>
                <button
                  onClick={handleCopy}
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: copied ? "#111" : "#111",
                    color: "#fff",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {copied ? "Copied" : `Copy ${format.toUpperCase()}`}
                </button>
              </div>
            </div>
          </section>

          {/* ─── Footer ───────────────────────────────────────────────── */}
          <footer
            style={{
              padding: "24px 24px 48px",
              textAlign: "center",
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              color: "rgba(0,0,0,0.35)",
            }}
          >
            Made by{" "}
            <a
              href="/"
              style={{
                color: "rgba(0,0,0,0.55)",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              Neil McArdle
            </a>
          </footer>
        </main>

        {/* Toast for copy feedback */}
        {copied && (
          <div
            style={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#111",
              color: "#fff",
              fontFamily: "var(--font-inter)",
              fontSize: 13,
              padding: "10px 16px",
              borderRadius: 10,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              zIndex: 100,
              pointerEvents: "none",
            }}
          >
            Copied {format.toUpperCase()}
          </div>
        )}
      </div>
    </>
  );
}
