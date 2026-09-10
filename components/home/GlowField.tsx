"use client";

import { useEffect, useRef } from "react";
import { createGlowShader, type GlowShader } from "./glowShader";
import { currentTheme, subscribeTheme } from "./theme";

export default function GlowField({
  className,
  paused = false,
}: {
  className?: string;
  paused?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shaderRef = useRef<GlowShader | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let shader: GlowShader;
    try {
      shader = createGlowShader(canvas, {
        background: { dark: "#0a0a0a", light: "#fbf9f3" },
        paused: pausedRef.current,
        theme: currentTheme(),
      });
    } catch {
      return;
    }
    shaderRef.current = shader;
    const unsubscribe = subscribeTheme(() =>
      shader.setTheme(
        currentTheme(),
        document.documentElement.classList.contains("theme-reveal"),
      ),
    );
    return () => {
      unsubscribe();
      shader.destroy();
      shaderRef.current = null;
    };
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    shaderRef.current?.setPaused(paused);
  }, [paused]);

  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
