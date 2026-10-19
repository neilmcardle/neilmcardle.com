"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Mark, PER_ICON, samplePoints } from "@/app/_orbit/Orbit";
import { FRAGMENT, INK, VERTEX } from "@/app/_orbit/particles";
import styles from "./case.module.css";

export default function NMark() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const glyphRef = useRef<HTMLSpanElement>(null);
  const hot = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const node = nodeRef.current;
    if (!canvas || !node) return;
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
      uTime: { value: 0 },
      uDot: { value: 1.4 * dpr },
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
    let geometry: THREE.BufferGeometry | null = null;
    let cancelled = false;

    samplePoints("n", glyphRef.current?.querySelector("svg") ?? null).then(
      (set) => {
        if (cancelled) return;
        const icon = new Float32Array(PER_ICON);
        const logo = new Float32Array(PER_ICON * 2);
        const sphere = new Float32Array(PER_ICON * 3);
        const rnd = new Float32Array(PER_ICON);
        for (let k = 0; k < PER_ICON; k += 1) {
          logo[k * 2] = set ? set[k * 2] : 0;
          logo[k * 2 + 1] = set ? set[k * 2 + 1] : 0;
          const u = Math.random() * 2 - 1;
          const a = Math.random() * Math.PI * 2;
          const ring = Math.sqrt(1 - u * u);
          const shell = 1 - Math.random() * 0.06;
          sphere[k * 3] = ring * Math.cos(a) * shell;
          sphere[k * 3 + 1] = u * shell;
          sphere[k * 3 + 2] = ring * Math.sin(a) * shell;
          rnd[k] = Math.random();
        }
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(PER_ICON * 3), 3),
        );
        geometry.setAttribute("icon", new THREE.BufferAttribute(icon, 1));
        geometry.setAttribute("logo", new THREE.BufferAttribute(logo, 2));
        geometry.setAttribute("sphere", new THREE.BufferAttribute(sphere, 3));
        geometry.setAttribute("rnd", new THREE.BufferAttribute(rnd, 1));
        const points = new THREE.Points(geometry, material);
        points.frustumCulled = false;
        scene.add(points);
        setReady(true);
      },
    );

    const place = () => {
      const box = canvas.getBoundingClientRect();
      renderer.setSize(box.width, box.height, false);
      camera.right = box.width;
      camera.bottom = box.height;
      camera.updateProjectionMatrix();
      const r = node.getBoundingClientRect();
      uniforms.uCenter.value[0].set(
        r.left + r.width / 2 - box.left,
        r.top + r.height / 2 - box.top,
      );
      uniforms.uScale.value = r.width;
    };
    const sizer = new ResizeObserver(place);
    sizer.observe(canvas);
    place();

    let form = 0;
    let frame = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!reduced) uniforms.uTime.value += dt;
      const target = hot.current ? 1 : 0;
      form = reduced ? target : form + (target - form) * Math.min(1, dt * 3);
      uniforms.uForm.value[0] = form;
      if (geometry) renderer.render(scene, camera);
      frame = document.hidden ? 0 : requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    const onVisible = () => {
      if (!document.hidden && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      sizer.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      geometry?.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <Link
      href="/"
      className={styles.nmark}
      aria-label="Neil McArdle, home"
      data-ready={ready || undefined}
      onPointerEnter={() => (hot.current = true)}
      onPointerLeave={() => (hot.current = false)}
      onFocus={() => (hot.current = true)}
      onBlur={() => (hot.current = false)}
    >
      <canvas
        ref={canvasRef}
        className={styles.nmarkCanvas}
        aria-hidden="true"
      />
      <span ref={nodeRef} className={styles.nmarkNode} aria-hidden="true">
        <span ref={glyphRef} className={styles.nmarkGlyph}>
          <Mark mark="n" />
        </span>
      </span>
    </Link>
  );
}
