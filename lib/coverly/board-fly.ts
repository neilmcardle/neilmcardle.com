import { getFlyConfig } from "./fly-config";
import { createSample } from "./sfx";

const swish = createSample("/coverly/swish.mp3");
const pageTurn = createSample("/coverly/page-turn.mp3");

export function primeFlySounds() {
  pageTurn.prime();
  swish.prime();
}

function land(el: HTMLElement) {
  swish.play(getFlyConfig().swish);
  bounce(el);
}

function bounce(el: HTMLElement) {
  const { bounce: peak, bounceMs } = getFlyConfig();
  if (bounceMs <= 0 || peak <= 1) return;
  el.animate(
    [
      { transform: "scale(1)" },
      { transform: `scale(${peak})` },
      { transform: `scale(${1 - (peak - 1) * 0.22})` },
      { transform: "scale(1)" },
    ],
    { duration: bounceMs, easing: "cubic-bezier(0.3, 1.4, 0.5, 1)" },
  );
}

export function flyToBoard(img?: HTMLImageElement | null) {
  if (typeof window === "undefined" || !img) return;
  const target = document.querySelector<HTMLElement>(
    '[data-fly-target="board"]',
  );
  const reduce = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!target) return;
  pageTurn.play(getFlyConfig().turn);

  if (reduce) {
    land(target);
    return;
  }

  swish.prime();

  const cfg = getFlyConfig();
  const s = img.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const clone = img.cloneNode(true) as HTMLImageElement;
  Object.assign(clone.style, {
    position: "fixed",
    left: `${s.left}px`,
    top: `${s.top}px`,
    width: `${s.width}px`,
    height: `${s.height}px`,
    margin: "0",
    zIndex: "100",
    pointerEvents: "none",
    objectFit: "cover",
    borderRadius: "8px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(clone);

  const dxE = b.left + b.width / 2 - (s.left + s.width / 2);
  const dyE = b.top + b.height / 2 - (s.top + s.height / 2);
  const dxA = dxE * cfg.arcX;
  const dyA = dyE * cfg.arcY - cfg.lift;

  const anim = clone.animate(
    [
      {
        transform: "translate(0,0) scale(0.55) rotate(0)",
        opacity: 0,
        borderRadius: "50%",
        offset: 0,
      },
      {
        transform: `translate(0,-14px) scale(${cfg.pop}) rotate(${(-cfg.spin * 0.022).toFixed(2)}deg)`,
        opacity: 1,
        borderRadius: "14px",
        offset: 0.14,
      },
      {
        transform: `translate(${dxA}px,${dyA}px) scale(0.8) rotate(${(cfg.spin * 0.556).toFixed(2)}deg)`,
        opacity: 1,
        borderRadius: "40%",
        offset: 0.55,
      },
      {
        transform: `translate(${dxE}px,${dyE}px) scale(${cfg.endScale}) rotate(${cfg.spin}deg)`,
        opacity: cfg.endOpacity,
        borderRadius: "50%",
        offset: 1,
      },
    ],
    { duration: cfg.duration, easing: "cubic-bezier(0.5, 0.02, 0.5, 1)" },
  );
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    clone.remove();
    land(target);
  };
  anim.onfinish = settle;
  anim.oncancel = settle;
  setTimeout(settle, cfg.duration + 400);
}
