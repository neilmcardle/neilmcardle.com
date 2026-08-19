"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";

const SCROLL_TARGET_ID = "intro";

const CARD_W = 336;
const MAX_TILT = 7;

const CARD_GRADIENT =
  "linear-gradient(180deg, #14120e 0%, #0a0a09 55%, #000000 100%)";

const BASE_FADE =
  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.62) 42%, rgba(0,0,0,0.97) 66%, rgb(0,0,0) 100%)";

const GLINT_SWEEP =
  "linear-gradient(90deg, rgba(111,233,255,0) 0%, rgba(111,233,255,0.24) 22%, rgba(255,255,255,0.5) 44%, rgba(255,122,217,0.26) 62%, rgba(255,217,138,0.18) 80%, rgba(255,217,138,0) 100%)";

const DOT_TILE = "4.45361px 4.46743px";

const CARD_FIT = "min(1, (100svh - 176px) / 480px, (100vw - 24px) / 336px)";

const LABEL_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", var(--font-inter), sans-serif';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export default function HeroCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const glintRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const frameRef = useRef<number | null>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const paint = useCallback(() => {
    frameRef.current = null;
    const card = cardRef.current;
    const band = bandRef.current;
    if (!card || !band) return;
    const { x, y } = pointerRef.current;
    card.style.transform = `rotateX(${(0.5 - y) * 2 * MAX_TILT}deg) rotateY(${(x - 0.5) * 2 * MAX_TILT}deg)`;
    band.style.transform = `translateX(${x * CARD_W}px) rotate(-18deg)`;
  }, []);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: clamp01((event.clientX - rect.left) / rect.width),
      y: clamp01((event.clientY - rect.top) / rect.height),
    };
    if (frameRef.current === null)
      frameRef.current = requestAnimationFrame(paint);
  };

  const handlePointerEnter = () => {
    if (reducedRef.current) return;
    if (cardRef.current) cardRef.current.style.transition = "none";
    if (glintRef.current) glintRef.current.style.opacity = "1";
  };

  const handlePointerLeave = () => {
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

  const scrollToNextSection = () => {
    document
      .getElementById(SCROLL_TARGET_ID)
      ?.scrollIntoView({ block: "start" });
  };

  return (
    <section className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#010101] px-3 py-[48px]">
      <div
        className="hero-card-scaler shrink-0"
        style={{ perspective: "900px", zoom: CARD_FIT }}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
      >
        <div
          ref={cardRef}
          className="relative isolate h-[480px] w-[336px] overflow-hidden rounded-[12px]"
          style={{
            background: CARD_GRADIENT,
            boxShadow: "0px 18px 20px rgba(0,0,0,0.55)",
          }}
        >
          <img
            src="/hero/n-mark.svg"
            alt=""
            aria-hidden="true"
            className="absolute left-[16px] top-[16px] h-[316px] w-[304px] max-w-none"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: "url(/hero/dot-matrix.svg)",
              backgroundSize: DOT_TILE,
            }}
          />

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
              className="absolute left-[-95px] top-[-170px] h-[820px] w-[190px]"
              style={{
                backgroundImage: GLINT_SWEEP,
                transform: "translateX(168px) rotate(-18deg)",
              }}
            />
          </div>

          <Image
            src="/hero/portrait.png"
            alt="Portrait of Neil McArdle"
            width={480}
            height={480}
            priority
            className="pointer-events-none absolute left-[-13px] top-[8px] h-[384px] w-[362px] max-w-none object-cover"
          />

          <div
            aria-hidden="true"
            className="absolute left-0 top-[192px] h-[288px] w-[336px]"
            style={{ backgroundImage: BASE_FADE }}
          />

          <div className="absolute left-[16px] top-[375px] flex w-[304px] flex-col items-start gap-[16px] [word-break:break-word]">
            <h1
              className="w-full text-[32px] text-cream"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 700,
                letterSpacing: "1.8px",
                lineHeight: "36px",
              }}
            >
              <span className="block">NEIL</span>{" "}
              <span className="block">McARDLE</span>
            </h1>
            <p
              className="flex h-[9px] w-full flex-col justify-center text-[12px] uppercase text-tan"
              style={{
                fontFamily: LABEL_STACK,
                letterSpacing: "1.6138px",
                lineHeight: "19.5px",
              }}
            >
              Artist · Designer · London
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToNextSection}
        aria-label="Scroll to content"
        className="absolute bottom-[28px] left-1/2 flex h-[48px] w-[48px] -translate-x-1/2 items-center justify-center rounded-full transition-transform duration-200 hover:translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <svg
          width="28"
          height="12.4"
          viewBox="0 0 28.0004 12.4039"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M26.0002 2.00021L14.0002 10.0002L2.00021 2.00021"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </section>
  );
}
