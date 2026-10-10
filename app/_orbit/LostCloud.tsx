"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FRAGMENT, INK, VERTEX } from "./particles";

const POINTS = 3600;
const SAMPLE = 480;

function sampleLabel(font: string) {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE;
  canvas.height = SAMPLE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  let size = 100;
  ctx.font = `500 ${size}px ${font}`;
  const word = "Wander back";
  const measure = () => {
    const arrow = size * 0.78;
    const gap = size * 0.32;
    return { arrow, gap, total: arrow + gap + ctx.measureText(word).width };
  };
  size *= (SAMPLE * 0.9) / measure().total;
  ctx.font = `500 ${size}px ${font}`;
  const { arrow, gap, total } = measure();
  const left = (SAMPLE - total) / 2;
  const mid = SAMPLE / 2;
  const head = size * 0.28;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = size * 0.09;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(left + arrow, mid);
  ctx.lineTo(left, mid);
  ctx.moveTo(left + head, mid - head);
  ctx.lineTo(left, mid);
  ctx.lineTo(left + head, mid + head);
  ctx.stroke();
  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";
  ctx.fillText(word, left + arrow + gap, mid + size * 0.04);
  const data = ctx.getImageData(0, 0, SAMPLE, SAMPLE).data;
  const filled: number[] = [];
  for (let i = 0; i < SAMPLE * SAMPLE; i += 1)
    if (data[i * 4 + 3] > 110) filled.push(i);
  if (!filled.length) return null;
  const points = new Float32Array(POINTS * 2);
  for (let k = 0; k < POINTS; k += 1) {
    const index = filled[Math.floor(Math.random() * filled.length)];
    points[k * 2] = ((index % SAMPLE) + Math.random()) / SAMPLE - 0.5;
    points[k * 2 + 1] =
      (Math.floor(index / SAMPLE) + Math.random()) / SAMPLE - 0.5;
  }
  return points;
}

export default function LostCloud({
  className,
  formed = false,
}: {
  className?: string;
  formed?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formedRef = useRef(formed);
  const kickRef = useRef<() => void>(() => {});

  useEffect(() => {
    formedRef.current = formed;
    kickRef.current();
  }, [formed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
    } catch {
      return;
    }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
    const uniforms = {
      uForm: { value: [0] },
      uCenter: { value: [new THREE.Vector2()] },
      uScale: { value: 1 },
      uTime: { value: Math.random() * 40 },
      uDot: { value: 1.7 * dpr },
      uInk: { value: new THREE.Color(INK) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      defines: { COUNT: 1 },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const sphere = new Float32Array(POINTS * 3);
    const rnd = new Float32Array(POINTS);
    for (let k = 0; k < POINTS; k += 1) {
      const u = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2;
      const ring = Math.sqrt(1 - u * u);
      const shell = 1 - Math.random() * 0.06;
      sphere[k * 3] = ring * Math.cos(a) * shell;
      sphere[k * 3 + 1] = u * shell;
      sphere[k * 3 + 2] = ring * Math.sin(a) * shell;
      rnd[k] = Math.random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(POINTS * 3), 3),
    );
    geometry.setAttribute(
      "icon",
      new THREE.BufferAttribute(new Float32Array(POINTS), 1),
    );
    const logo = new THREE.BufferAttribute(new Float32Array(POINTS * 2), 2);
    geometry.setAttribute("logo", logo);
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const set = sampleLabel(getComputedStyle(canvas).fontFamily);
      if (!set) return;
      logo.array.set(set);
      logo.needsUpdate = true;
    });
    geometry.setAttribute("sphere", new THREE.BufferAttribute(sphere, 3));
    geometry.setAttribute("rnd", new THREE.BufferAttribute(rnd, 1));
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.right = width;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      const s = Math.min(width, height) * 0.62;
      uniforms.uScale.value = s;
      uniforms.uDot.value =
        1.7 * dpr * Math.max(1, Math.min(1.5, Math.sqrt(s / 80)));
      uniforms.uCenter.value[0].set(width / 2, height / 2);
      renderer.render(scene, camera);
    };
    const sizer = new ResizeObserver(resize);
    sizer.observe(canvas);
    resize();

    let frame = 0;
    let last = performance.now();
    let form = 0;
    const draw = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      uniforms.uTime.value += dt;
      last = now;
      const target = formedRef.current ? 1 : 0;
      form += (target - form) * Math.min(1, dt * 2.6);
      uniforms.uForm.value[0] = form;
      renderer.render(scene, camera);
      frame = document.hidden ? 0 : requestAnimationFrame(draw);
    };
    kickRef.current = () => {
      if (!reduced) return;
      uniforms.uForm.value[0] = formedRef.current ? 1 : 0;
      renderer.render(scene, camera);
    };
    const onVisible = () => {
      if (!document.hidden && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };
    if (!reduced) {
      frame = requestAnimationFrame(draw);
      document.addEventListener("visibilitychange", onVisible);
    }

    return () => {
      cancelled = true;
      kickRef.current = () => {};
      cancelAnimationFrame(frame);
      sizer.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
