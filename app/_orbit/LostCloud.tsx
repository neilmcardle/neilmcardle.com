"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FRAGMENT, INK, VERTEX } from "./particles";

const POINTS = 2400;

export default function LostCloud({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    geometry.setAttribute(
      "logo",
      new THREE.BufferAttribute(new Float32Array(POINTS * 2), 2),
    );
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
    const draw = (now: number) => {
      uniforms.uTime.value += Math.min(0.1, (now - last) / 1000);
      last = now;
      renderer.render(scene, camera);
      frame = document.hidden ? 0 : requestAnimationFrame(draw);
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
