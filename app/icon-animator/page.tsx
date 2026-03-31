"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useControls, LevaPanel, folder } from "leva";

// ─── Shadow tokens ───────────────────────────────────────────────────────────
const SH_SM = "0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)";
const SH_MD = "0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px -2px rgba(0,0,0,0.08), 0 6px 16px rgba(0,0,0,0.06)";

// ─── Icon library ────────────────────────────────────────────────────────────
type IconDef = { id: string; name: string; el: React.ReactNode };

const ICONS: IconDef[] = [
  { id: "sun",         name: "Sun",         el: <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></> },
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

// ─── Transform origin 9-point map ────────────────────────────────────────────
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

// ─── Transform origin picker ─────────────────────────────────────────────────
function OriginPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, width: 72 }}>
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

// ─── Page ────────────────────────────────────────────────────────────────────
export default function IconAnimator() {
  const [iconId,     setIconId]     = useState("zap");
  const [customIcon, setCustomIcon] = useState<{ viewBox: string; inner: string } | null>(null);
  const [pasteOpen,  setPasteOpen]  = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [origin,     setOrigin]     = useState("50% 50%");
  const [copied,     setCopied]     = useState(false);
  const [panelWidth, setPanelWidth] = useState(256);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPanelResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = panelWidth;
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(200, Math.min(520, startW + (startX - ev.clientX)));
      setPanelWidth(w);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const {
    preset, duration, delay, iterations, direction, fillMode, easing,
    travel, scale,
    color, stroked, strokeWidth, strokeCap, strokeJoin, filled, fillColor,
    shadowEnabled, shadowPreset, shadowColor, shadowOpacity,
    iconSize, previewBg,
    format,
  } = useControls({
    Animation: folder({
      preset: {
        label: "Preset",
        value: "bounce",
        options: { Bounce:"bounce", Spin:"spin", Pulse:"pulse", Wiggle:"wiggle", Pop:"pop", Shake:"shake", Float:"float", Heartbeat:"heartbeat", Blink:"blink", Swing:"swing", Draw:"draw" },
      },
    }),
    Timing: folder({
      duration:   { label: "Duration (s)",  value: 1.2,        min: 0.1,  max: 5,    step: 0.05 },
      delay:      { label: "Delay (s)",      value: 0,          min: 0,    max: 3,    step: 0.05 },
      iterations: { label: "Iterations",     value: "infinite", options: { "1×":"1", "2×":"2", "3×":"3", "5×":"5", "∞":"infinite" } },
      direction:  { label: "Direction",      value: "normal",   options: { Normal:"normal", Reverse:"reverse", Alternate:"alternate", "Alt Reverse":"alternate-reverse" } },
      fillMode:   { label: "Fill Mode",      value: "none",     options: { None:"none", Forwards:"forwards", Backwards:"backwards", Both:"both" } },
      easing:     { label: "Easing",         value: "ease-in-out", options: { Ease:"ease", "Ease In":"ease-in", "Ease Out":"ease-out", "Ease In Out":"ease-in-out", Linear:"linear", Spring:"cubic-bezier(0.34,1.56,0.64,1)" } },
    }),
    Motion: folder({
      travel: { label: "Travel (px)",  value: 16,  min: 2,    max: 48,   step: 1    },
      scale:  { label: "Scale Peak",   value: 1.25, min: 1.02, max: 2.5,  step: 0.01 },
    }),
    Style: folder({
      color:       { label: "Color",        value: "#111111" },
      filled:      { label: "Fill",         value: false   },
      fillColor:   { label: "Fill Color",   value: "#111111", render: get => get("Style.filled") },
      stroked:     { label: "Stroke",       value: true },
      strokeWidth: { label: "Stroke Width", value: 1.5,    min: 0.25, max: 4,    step: 0.25, render: get => get("Style.stroked") },
      strokeCap:   { label: "Stroke Cap",   value: "round",  options: { Round:"round", Square:"square", Butt:"butt" }, render: get => get("Style.stroked") },
      strokeJoin:  { label: "Stroke Join",  value: "round",  options: { Round:"round", Miter:"miter",  Bevel:"bevel" }, render: get => get("Style.stroked") },
    }),
    Shadow: folder({
      shadowEnabled: { label: "Enable",  value: false },
      shadowPreset:  { label: "Style",   value: "soft", options: { Soft:"soft", Dreamy:"dreamy", Sharp:"sharp", Long:"long" }, render: get => get("Shadow.shadowEnabled") },
      shadowColor:   { label: "Color",   value: "#000000", render: get => get("Shadow.shadowEnabled") },
      shadowOpacity: { label: "Opacity", value: 0.12, min: 0.02, max: 0.5, step: 0.01, render: get => get("Shadow.shadowEnabled") },
    }, { collapsed: true }),
    Preview: folder({
      iconSize:  { label: "Icon Size (px)",  value: 64,        min: 16, max: 128, step: 4 },
      previewBg: { label: "Background",      value: "#ffffff" },
    }),
    Export: folder({
      format: { label: "Format", value: "css", options: { CSS:"css", React:"react" } },
    }),
  });

  const icon = customIcon ? null : (ICONS.find(i => i.id === iconId) ?? ICONS[0]);
  const timing  = preset === "spin" ? "linear" : easing;
  const kf      = makeKeyframes(preset, travel, scale);
  const delayStr = delay > 0 ? ` ${delay}s` : "";
  const iterStr  = iterations !== "infinite" ? ` ${iterations}` : " infinite";
  const dirStr   = direction !== "normal" ? ` ${direction}` : "";
  const fillStr  = fillMode !== "none" ? ` ${fillMode}` : "";

  const shadowFilter = shadowEnabled ? makeShadowFilter(shadowPreset, shadowColor, shadowOpacity) : "none";
  const animKey = `${preset}-${duration}-${delay}-${iterations}-${direction}-${fillMode}-${easing}`;

  const animStyle: React.CSSProperties = {
    animation: `ia-${preset} ${duration}s ${timing}${delayStr}${iterStr}${dirStr}${fillStr}`,
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

  return (
    <>
      <style>{kf}</style>

      {/* Controls panel — custom container for reliable resize */}
      <div style={{ position: "fixed", top: 60, right: 20, width: panelWidth, zIndex: 200 }}>
        {/* Resize handle on left edge */}
        <div
          onMouseDown={onPanelResizeStart}
          style={{ position: "absolute", left: -4, top: 0, width: 8, height: "100%", cursor: "ew-resize", zIndex: 10 }}
        />
        <LevaPanel
          fill
          titleBar={{ title: "Controls", drag: false, filter: false }}
          theme={{
            colors: {
              elevation1: "#ffffff",
              elevation2: "#f8f8f7",
              elevation3: "rgba(0,0,0,0.05)",
              accent1: "#111111",
              accent2: "rgba(0,0,0,0.18)",
              highlight1: "rgba(0,0,0,0.72)",
              highlight2: "rgba(0,0,0,0.45)",
              highlight3: "rgba(0,0,0,0.28)",
              vivid1: "#111111",
              toolTipBackground: "#111111",
              toolTipText: "#ffffff",
            },
            radii: { xs: "4px", sm: "6px", lg: "10px" },
            shadows: {
              level1: "0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px -2px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.04)",
              level2: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.08)",
            },
            fonts: { sans: "var(--font-inter,-apple-system,BlinkMacSystemFont,sans-serif)", mono: "ui-monospace,monospace" },
            fontSizes: { root: "11px" },
            fontWeights: { label: "450", folder: "500", button: "500" },
            sizes: { rootWidth: "100%", controlWidth: "116px", rowHeight: "28px", titleBarHeight: "36px" },
            borderWidths: { root: "0px", focus: "1px", hover: "0px", active: "0px" },
          }}
        />
      </div>

      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8f8f7", fontFamily: "var(--font-inter)", overflow: "hidden" }}>

        {/* Header */}
        <header style={{ height: 48, borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgba(248,248,247,0.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/" style={{ color: "rgba(0,0,0,0.3)", display: "flex", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(0,0,0,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(0,0,0,0.3)")}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
            <span style={{ color: "rgba(0,0,0,0.12)" }}>·</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,0,0,0.7)", letterSpacing: "-0.01em" }}>Icon Animator</span>
          </div>
          <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: copied ? "#111" : "#fff", color: copied ? "#fff" : "rgba(0,0,0,0.65)", boxShadow: SH_SM, transition: "all 0.15s" }}>
            {copied
              ? <><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Copied</>
              : <><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy {format.toUpperCase()}</>
            }
          </button>
        </header>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* Left: icons + upload */}
          <aside style={{ width: 176, borderRight: "1px solid rgba(0,0,0,0.06)", overflowY: "auto", padding: "20px 12px", flexShrink: 0 }}>

            <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(0,0,0,0.3)", marginBottom: 8, paddingLeft: 4 }}>Custom SVG</p>
            <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
              <input ref={fileRef} type="file" accept=".svg,image/svg+xml" onChange={handleFile} style={{ display: "none" }} />
              <button onClick={() => fileRef.current?.click()} style={{ flex: 1, fontSize: 10, padding: "6px 0", borderRadius: 8, border: "none", cursor: "pointer", background: "#fff", color: "rgba(0,0,0,0.5)", boxShadow: SH_SM, transition: "all 0.15s" }}>Upload</button>
              <button onClick={() => setPasteOpen(v => !v)} style={{ flex: 1, fontSize: 10, padding: "6px 0", borderRadius: 8, border: "none", cursor: "pointer", background: pasteOpen ? "#111" : "#fff", color: pasteOpen ? "#fff" : "rgba(0,0,0,0.5)", boxShadow: SH_SM, transition: "all 0.15s" }}>Paste</button>
            </div>

            {pasteOpen && (
              <div style={{ marginBottom: 14 }}>
                <textarea value={pasteValue} onChange={e => { setPasteValue(e.target.value); setPasteError(""); }} placeholder="<svg>…</svg>" rows={4}
                  style={{ width: "100%", fontSize: 10, padding: 8, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", color: "rgba(0,0,0,0.7)", fontFamily: "monospace", resize: "none", outline: "none", boxSizing: "border-box" }} />
                {pasteError && <p style={{ fontSize: 10, color: "#e53e3e", marginTop: 4 }}>{pasteError}</p>}
                <button onClick={handlePaste} style={{ width: "100%", marginTop: 6, fontSize: 10, padding: "6px 0", borderRadius: 8, border: "none", cursor: "pointer", background: "#111", color: "#fff" }}>Apply</button>
              </div>
            )}

            {customIcon && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(0,0,0,0.3)", marginBottom: 6, paddingLeft: 4 }}>Loaded</p>
                <button onClick={() => setIconId("__custom__")} style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", background: iconId === "__custom__" ? "#111" : "transparent", color: iconId === "__custom__" ? "#fff" : "rgba(0,0,0,0.4)" }}>
                  <svg viewBox={customIcon.viewBox} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: customIcon.inner }} />
                </button>
              </div>
            )}

            {/* Origin picker */}
            <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(0,0,0,0.3)", marginBottom: 8, paddingLeft: 4, marginTop: 4 }}>Origin</p>
            <div style={{ paddingLeft: 4, marginBottom: 16 }}>
              <OriginPicker value={origin} onChange={setOrigin} />
              <p style={{ fontSize: 9, color: "rgba(0,0,0,0.3)", marginTop: 5 }}>{ORIGIN_POINTS.find(p => p.css === origin)?.label ?? origin}</p>
            </div>

            <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(0,0,0,0.3)", marginBottom: 8, paddingLeft: 4 }}>Library</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2 }}>
              {ICONS.map(ic => (
                <button key={ic.id} title={ic.name} onClick={() => { setIconId(ic.id); setCustomIcon(null); }}
                  style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", transition: "all 0.15s", background: iconId === ic.id && !customIcon ? "#111" : "transparent", color: iconId === ic.id && !customIcon ? "#fff" : "rgba(0,0,0,0.4)" }}
                  onMouseEnter={e => { if (!(iconId === ic.id && !customIcon)) e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
                  onMouseLeave={e => { if (!(iconId === ic.id && !customIcon)) e.currentTarget.style.background = "transparent"; }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, strokeWidth: 1.5 }}>
                    {ic.el}
                  </svg>
                </button>
              ))}
            </div>
          </aside>

          {/* Center: preview + code */}
          <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, padding: "32px 40px", overflowY: "auto", backgroundImage: "radial-gradient(rgba(0,0,0,0.055) 1px,transparent 1px)", backgroundSize: "20px 20px" }}>

            {/* Icon card */}
            <div style={{ width: iconSize * 2.25, height: iconSize * 2.25, minWidth: 100, minHeight: 100, borderRadius: iconSize * 0.44, background: previewBg, boxShadow: SH_MD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
              {customIcon ? (
                <svg key={animKey} viewBox={customIcon.viewBox} {...svgShared} style={{ width: iconSize, height: iconSize, ...animStyle }} dangerouslySetInnerHTML={{ __html: customIcon.inner }} />
              ) : (
                <svg key={animKey} viewBox="0 0 24 24" {...svgShared} style={{ width: iconSize, height: iconSize, ...animStyle }}>
                  {icon?.el}
                </svg>
              )}
            </div>

            {/* Code block */}
            <div style={{ width: "100%", maxWidth: 560, borderRadius: 16, background: "#fff", boxShadow: SH_SM, overflow: "hidden", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {["css","react"].map(f => (
                    <span key={f} style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: format === f ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.25)", fontWeight: format === f ? 600 : 400, cursor: "default" }}>
                      {f}
                    </span>
                  ))}
                </div>
                <button onClick={handleCopy} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: copied ? "#111" : "rgba(0,0,0,0.05)", color: copied ? "#fff" : "rgba(0,0,0,0.45)", transition: "all 0.15s" }}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre style={{ margin: 0, padding: "14px 16px", fontSize: 11, lineHeight: 1.75, fontFamily: "monospace", color: "rgba(0,0,0,0.6)", overflowX: "auto", whiteSpace: "pre", maxHeight: 240, overflowY: "auto" }}>
                {output}
              </pre>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
