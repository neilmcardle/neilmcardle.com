"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

type RGBA = [number, number, number, number];

const WATER: RGBA = [0, 0.388, 0.706, 1];
const HIGHLIGHT: RGBA = [0.804, 0.961, 1, 1];
const PHASE_PER_SECOND = 3;

const VERTEX = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT = `
precision highp float;

uniform vec2 uResolution;
uniform vec4 uWater;
uniform vec4 uHighlight;
uniform float uIntensity;
uniform float uPhase;
uniform float uScale;
uniform vec2 uCenter;

void main() {
  const float TAU = 6.28318530718;
  vec2 uvRaw = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uResolution;
  vec2 o = uCenter / 100.0;
  vec2 uv = (uvRaw - o) / uScale + (1.0 - o);
  float t = uPhase * TAU / 100.0 + 23.0;
  vec2 p = fract(uv * uResolution / min(uResolution.x, uResolution.y)) * TAU - 250.0;
  vec2 i = p;
  float c = 1.0;
  float inten = mix(0.002519, 0.01178, uIntensity);
  for (int n = 0; n < 5; n++) {
    float nt = t * float(n + 1);
    i = p + vec2(cos(nt - i.x) + sin(nt + i.y), sin(nt - i.y) + cos(nt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + nt) / inten), p.y / (cos(i.y + nt) / inten)));
  }
  c /= 5.0;
  c = 1.17 - pow(c, 1.4);
  float mask = clamp(pow(abs(c), 8.0), 0.0, 1.0);
  float alpha = mix(uWater.a, uHighlight.a, mask);
  gl_FragColor = vec4(mix(uWater.rgb, uHighlight.rgb, mask) * alpha, alpha);
}
`;

export default function CausticField({
  className,
  paused = false,
  intensity = 0.5,
  scale = 1,
}: {
  className?: string;
  paused?: boolean;
  intensity?: number;
  scale?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const syncRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });
    const gl = renderer.gl;
    if (!gl) return;

    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    host.appendChild(canvas);

    const uniforms = {
      uResolution: { value: [1, 1] },
      uWater: { value: WATER },
      uHighlight: { value: HIGHLIGHT },
      uIntensity: { value: intensity },
      uPhase: { value: 0 },
      uScale: { value: scale },
      uCenter: { value: [50, 50] },
    };
    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms,
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    let frame = 0;
    let last = 0;
    let visible = true;

    const draw = () => renderer.render({ scene: mesh });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setSize(w, h);
      uniforms.uResolution.value = [canvas.width, canvas.height];
      draw();
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      uniforms.uPhase.value =
        (uniforms.uPhase.value + dt * PHASE_PER_SECOND) % 100;
      draw();
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      const run = visible && !pausedRef.current;
      if (run && !frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      } else if (!run && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    syncRef.current = sync;

    const sizer = new ResizeObserver(resize);
    sizer.observe(host);
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    watcher.observe(host);

    resize();
    sync();

    return () => {
      syncRef.current = null;
      if (frame) cancelAnimationFrame(frame);
      sizer.disconnect();
      watcher.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [intensity, scale]);

  useEffect(() => {
    pausedRef.current = paused;
    syncRef.current?.();
  }, [paused]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
