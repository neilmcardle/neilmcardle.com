"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useMediaQuery } from "@/lib/hooks/browserStore";

export const ActiveContext = createContext(false);
export const useActive = () => useContext(ActiveContext);

const ScaleContext = createContext(1);
export const useScale = () => useContext(ScaleContext);

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function Fit({
  width,
  height,
  children,
  max = 1.6,
}: {
  width: number;
  height: number;
  children: ReactNode;
  max?: number;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useIsoLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setScale(Math.min(max, r.width / width, r.height / height));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height, max]);

  const inner: CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width,
    height,
    transform: `translate(-50%, -50%) scale(${scale || 1})`,
    visibility: scale ? "visible" : "hidden",
  };

  return (
    <div
      ref={outer}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <div style={inner}>
        <ScaleContext.Provider value={scale || 1}>
          {children}
        </ScaleContext.Provider>
      </div>
    </div>
  );
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}

export function hash(x: number, y: number, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
