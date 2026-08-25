function bounce(el: HTMLElement) {
  el.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.18)" },
      { transform: "scale(0.96)" },
      { transform: "scale(1)" },
    ],
    { duration: 420, easing: "cubic-bezier(0.3, 1.4, 0.5, 1)" },
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
  if (reduce) {
    bounce(target);
    return;
  }

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
  const dxA = dxE * 0.55;
  const dyA = dyE * 0.5 - 150;

  const anim = clone.animate(
    [
      {
        transform: "translate(0,0) scale(0.55) rotate(0)",
        opacity: 0,
        borderRadius: "50%",
        offset: 0,
      },
      {
        transform: "translate(0,-14px) scale(1.18) rotate(-8deg)",
        opacity: 1,
        borderRadius: "14px",
        offset: 0.14,
      },
      {
        transform: `translate(${dxA}px,${dyA}px) scale(0.8) rotate(200deg)`,
        opacity: 1,
        borderRadius: "40%",
        offset: 0.55,
      },
      {
        transform: `translate(${dxE}px,${dyE}px) scale(0.08) rotate(360deg)`,
        opacity: 0.35,
        borderRadius: "50%",
        offset: 1,
      },
    ],
    { duration: 760, easing: "cubic-bezier(0.5, 0.02, 0.5, 1)" },
  );
  anim.onfinish = () => {
    clone.remove();
    bounce(target);
  };
}
