"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

const MAX_TILT = 6;

const DOT_TILE = "3px 3.0093px";

const CARD_GRADIENT =
  "linear-gradient(180deg, #14120e 0%, #0a0a09 55%, #000000 100%)";

const BASE_FADE =
  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.62) 42%, rgba(0,0,0,0.97) 66%, rgb(0,0,0) 100%)";

const GLINT_SWEEP =
  "linear-gradient(90deg, rgba(111,233,255,0) 0%, rgba(111,233,255,0.24) 22%, rgba(255,255,255,0.5) 44%, rgba(255,122,217,0.26) 62%, rgba(255,217,138,0.18) 80%, rgba(255,217,138,0) 100%)";

const SWEEP_CLASS = "foil-glint-sweeping";

export default function FoilCard({
  mark,
  image,
  className = "",
  hideFade = false,
}: {
  mark?: ReactNode;
  image?: { src: string; alt: string };
  className?: string;
  hideFade?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glintRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const frameRef = useRef<number | null>(null);
  const reducedRef = useRef(false);
  const coarseRef = useRef(false);

  const runSweep = useCallback(() => {
    const glint = glintRef.current;
    const band = bandRef.current;
    if (!glint || !band || reducedRef.current) return;
    glint.style.opacity = "1";
    band.style.transform = "";
    band.classList.remove(SWEEP_CLASS);
    void band.offsetWidth;
    band.classList.add(SWEEP_CLASS);
  }, []);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    coarseRef.current = !window.matchMedia("(hover: hover) and (pointer: fine)")
      .matches;

    let observer: IntersectionObserver | undefined;
    const card = cardRef.current;
    if (coarseRef.current && card && !reducedRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) runSweep();
          });
        },
        { threshold: 0.55 },
      );
      observer.observe(card);
    }
    return () => {
      observer?.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [runSweep]);

  const paint = useCallback(() => {
    frameRef.current = null;
    const card = cardRef.current;
    const band = bandRef.current;
    if (!card || !band) return;
    const { x, y } = pointerRef.current;
    card.style.transform = `rotateX(${(0.5 - y) * 2 * MAX_TILT}deg) rotateY(${(x - 0.5) * 2 * MAX_TILT}deg)`;
    band.style.transform = `translateX(${x * card.offsetWidth - band.offsetWidth / 2}px) rotate(-18deg)`;
  }, []);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedRef.current || coarseRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
    if (frameRef.current === null)
      frameRef.current = requestAnimationFrame(paint);
  };

  const handlePointerEnter = () => {
    if (reducedRef.current || coarseRef.current) return;
    if (cardRef.current) cardRef.current.style.transition = "none";
    if (glintRef.current) glintRef.current.style.opacity = "1";
  };

  const handlePointerLeave = () => {
    if (coarseRef.current) return;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (cardRef.current) {
      cardRef.current.style.transition =
        "transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1)";
      cardRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
    if (glintRef.current) glintRef.current.style.opacity = "0";
  };

  return (
    <div
      className={className}
      style={{ perspective: "900px" }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      <div
        ref={cardRef}
        className="relative isolate aspect-video w-full overflow-hidden rounded-[12px] border border-white/5"
        style={{
          background: CARD_GRADIENT,
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.06), 0px 18px 20px rgba(0,0,0,0.55)",
        }}
      >
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center opacity-20"
          >
            <div className="h-[64%] w-[64%]">{mark}</div>
          </div>
        )}

        <div
          ref={glintRef}
          aria-hidden="true"
          className="absolute inset-0 opacity-0 mix-blend-screen"
          style={{
            transition: "opacity 260ms ease",
            maskImage: "url(/hero/dot-mask.svg)",
            maskSize: DOT_TILE,
            WebkitMaskImage: "url(/hero/dot-mask.svg)",
            WebkitMaskSize: DOT_TILE,
          }}
        >
          <div
            ref={bandRef}
            className="absolute left-0 top-[-50%] h-[200%] w-[46%]"
            style={{
              backgroundImage: GLINT_SWEEP,
              transform: "rotate(-18deg)",
            }}
          />
        </div>

        {!hideFade && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[60%]"
            style={{ backgroundImage: BASE_FADE }}
          />
        )}
      </div>
    </div>
  );
}
