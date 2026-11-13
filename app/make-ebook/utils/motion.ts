export const EASE_OUT = "cubic-bezier(0.2, 0.8, 0, 1)";
export const EASE_IN = "cubic-bezier(0.55, 0, 1, 0.45)";

export function reducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollMotion(): ScrollBehavior {
  return reducedMotion() ? "auto" : "smooth";
}

export const EXIT_MENU_MS = 96;
export const EXIT_MODAL_MS = 128;

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  const slope = (a: number, b: number, t: number) =>
    3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = slope(x1, x2, t);
      if (Math.abs(d) < 1e-6) break;
      t -= (at(x1, x2, t) - x) / d;
      t = Math.min(1, Math.max(0, t));
    }
    return at(y1, y2, t);
  };
}

export const easeOut = bezier(0.2, 0.8, 0, 1);

export function tween(
  ms: number,
  step: (progress: number) => void,
): () => void {
  if (reducedMotion() || ms <= 0) {
    step(1);
    return () => {};
  }
  const start = performance.now();
  let frame = requestAnimationFrame(function tick(now) {
    const t = Math.min(1, (now - start) / ms);
    step(easeOut(t));
    if (t < 1) frame = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(frame);
}
