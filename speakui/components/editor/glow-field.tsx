"use client";

import { useEffect, useRef } from "react";
import { createGlowShader, type GlowShader } from "@/lib/design/glow-shader";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  theme: "light" | "dark";

  paused?: boolean;

  fallbackClassName?: string;
};

export function GlowField({
  className,
  theme,
  paused = false,
  fallbackClassName,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shaderRef = useRef<GlowShader | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let shader: GlowShader;
    try {
      shader = createGlowShader(canvas, {
        background: { dark: "#14120e", light: "#faf8f3" },
        paused: true,
      });
    } catch {
      if (wrapRef.current && fallbackClassName)
        wrapRef.current.className = cn(className, fallbackClassName);
      canvas.style.display = "none";
      return;
    }
    shaderRef.current = shader;
    return () => {
      shader.destroy();
      shaderRef.current = null;
    };
  }, [className, fallbackClassName]);

  useEffect(() => {
    pausedRef.current = paused;
    const apply = () =>
      shaderRef.current?.setPaused(pausedRef.current || document.hidden);
    apply();
    document.addEventListener("visibilitychange", apply);
    return () => document.removeEventListener("visibilitychange", apply);
  }, [paused]);

  useEffect(() => {
    shaderRef.current?.setTheme(theme, true);
  }, [theme]);

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
