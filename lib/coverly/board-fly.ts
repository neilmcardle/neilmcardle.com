import { BOARDS_MARK_PATHS, BOARDS_MARK_VIEWBOX } from "./boards-mark";
import { getFlyConfig } from "./fly-config";
import { createSample } from "./sfx";

export const FLY_EVENT = "coverly:fly";

export type FlyEventDetail = { phase: "start" | "land" };

const swish = createSample("/coverly/swish.mp3");
const pageTurn = createSample("/coverly/page-turn.mp3");

const MARK_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BOARDS_MARK_VIEWBOX}">${BOARDS_MARK_PATHS.map(
    (d) => `<path d="${d}"/>`,
  ).join("")}</svg>`,
)}")`;

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const x = (t: number) => ((ax * t + bx) * t + cx) * t;
  const y = (t: number) => ((ay * t + by) * t + cy) * t;
  const slope = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (progress: number) => {
    let t = progress;
    for (let i = 0; i < 8; i++) {
      const error = x(t) - progress;
      const d = slope(t);
      if (Math.abs(error) < 1e-5 || Math.abs(d) < 1e-6) break;
      t -= error / d;
    }
    return y(Math.min(1, Math.max(0, t)));
  };
}

const across = bezier(0.45, 0, 0.25, 1);
const rise = bezier(0.25, 0.55, 0.35, 1);

export function primeFlySounds() {
  pageTurn.prime();
  swish.prime();
}

function emit(phase: FlyEventDetail["phase"]) {
  document.dispatchEvent(
    new CustomEvent<FlyEventDetail>(FLY_EVENT, { detail: { phase } }),
  );
}

function press(el: HTMLElement) {
  el.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(0.95)" },
      { transform: "scale(1)" },
    ],
    { duration: 220, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  );
}

function layer(css: string) {
  const el = document.createElement("div");
  el.style.cssText = `position:absolute;inset:0;${css}`;
  return el;
}

export function flyToBoard(img?: HTMLImageElement | null): Promise<void> {
  if (typeof window === "undefined" || !img) return Promise.resolve();
  const target = document.querySelector<HTMLElement>(
    '[data-fly-target="board"]',
  );
  if (!target) return Promise.resolve();

  const cfg = getFlyConfig();
  pageTurn.play(cfg.turn);
  emit("start");

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    swish.play(cfg.swish);
    emit("land");
    return Promise.resolve();
  }

  swish.prime();

  const glyph = target.querySelector<SVGElement>("[data-fly-icon] svg");
  const s = img.getBoundingClientRect();
  const end = glyph?.getBoundingClientRect();
  const size = end && end.width > 0 ? end.width : 16;
  const aim = () => {
    const r = (glyph ?? target).getBoundingClientRect();
    return glyph
      ? { x: r.left + size / 2, y: r.top + r.height / 2 }
      : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const color = getComputedStyle(glyph ?? target).color;
  const duration = cfg.duration;
  const mark = Math.min(0.88, Math.max(0.64, cfg.mark));
  const ink = Math.min(0.8, Math.max(0.1, cfg.ink));
  const sx = size / s.width;
  const sy = size / s.height;

  const outer = document.createElement("div");
  Object.assign(outer.style, {
    position: "fixed",
    left: `${s.left}px`,
    top: `${s.top}px`,
    width: `${s.width}px`,
    height: `${s.height}px`,
    zIndex: "100",
    pointerEvents: "none",
    willChange: "transform",
  } satisfies Partial<CSSStyleDeclaration>);
  const shape = layer("");
  const face = layer(
    "overflow:hidden;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.3)",
  );
  const copy = img.cloneNode(true) as HTMLImageElement;
  copy.removeAttribute("id");
  copy.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;margin:0;object-fit:cover";
  const inkLayer = layer(`background:${color};opacity:0`);
  const markLayer = layer(`background:${color};opacity:0`);
  for (const [prop, value] of [
    ["mask-image", MARK_MASK],
    ["-webkit-mask-image", MARK_MASK],
    ["mask-size", "100% 100%"],
    ["-webkit-mask-size", "100% 100%"],
    ["mask-repeat", "no-repeat"],
    ["-webkit-mask-repeat", "no-repeat"],
  ]) {
    markLayer.style.setProperty(prop, value);
  }
  face.append(copy, inkLayer);
  shape.append(face, markLayer);
  outer.append(shape);
  document.body.appendChild(outer);

  const timing = {
    duration,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    fill: "forwards" as const,
  };
  img.animate(
    [{ opacity: 1 }, { opacity: 0.55, offset: 0.2 }, { opacity: 1 }],
    { duration },
  );
  shape.animate(
    [
      { transform: "scale(1, 1) rotate(0deg)", offset: 0 },
      {
        transform: `scale(${cfg.lift}, ${cfg.lift}) rotate(${-cfg.tilt}deg)`,
        offset: 0.14,
      },
      {
        transform: `scale(${sx * 3}, ${sy * 3}) rotate(${-cfg.tilt / 4}deg)`,
        offset: 0.55,
      },
      { transform: `scale(${sx}, ${sy}) rotate(0deg)`, offset: 0.86 },
      { transform: `scale(${sx}, ${sy}) rotate(0deg)`, offset: 1 },
    ],
    timing,
  );
  face.animate(
    [
      { borderRadius: "8px", offset: 0 },
      { borderRadius: "8px", offset: 0.14 },
      { borderRadius: "22%", offset: 0.55 },
      { borderRadius: "30%", offset: 1 },
    ],
    timing,
  );
  face.animate(
    [
      { opacity: 1, offset: 0 },
      { opacity: 1, offset: mark },
      { opacity: 0, offset: Math.min(0.95, mark + 0.18) },
      { opacity: 0, offset: 1 },
    ],
    { duration, fill: "forwards" },
  );
  inkLayer.animate(
    [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: ink },
      { opacity: 1, offset: Math.min(0.9, ink + 0.4) },
      { opacity: 1, offset: 1 },
    ],
    { duration, fill: "forwards" },
  );
  markLayer.animate(
    [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: mark },
      { opacity: 1, offset: Math.min(0.95, mark + 0.18) },
      { opacity: 1, offset: 1 },
    ],
    { duration, fill: "forwards" },
  );

  const originX = s.left + s.width / 2;
  const originY = s.top + s.height / 2;
  const started = performance.now();

  return new Promise((resolve) => {
    let frame = 0;
    let landed = false;
    const land = () => {
      if (landed) return;
      landed = true;
      cancelAnimationFrame(frame);
      outer.remove();
      swish.play(cfg.swish);
      press(target);
      emit("land");
      resolve();
    };
    const step = (now: number) => {
      const p = Math.min(1, (now - started) / duration);
      const to = aim();
      outer.style.transform = `translate(${(to.x - originX) * across(p)}px, ${(to.y - originY) * rise(p)}px)`;
      if (p < 1) frame = requestAnimationFrame(step);
      else land();
    };
    frame = requestAnimationFrame(step);
    setTimeout(land, duration + 400);
  });
}
