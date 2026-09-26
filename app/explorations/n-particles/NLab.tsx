"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";
import NParticles, { N_DEFAULTS, type Shape } from "../_lab/NParticles";
import styles from "./lab.module.css";

export default function NLab() {
  const [replay, setReplay] = useState(0);
  const router = useRouter();
  const values = useDialKit(
    "N particles",
    {
      replay: { type: "action", label: "Replay" },
      loop: N_DEFAULTS.loop,
      scatterAndReturn: {
        distance: [N_DEFAULTS.distance, 0, 4],
        hold: [N_DEFAULTS.hold, 0, 5],
        scatterTime: [N_DEFAULTS.scatterTime, 0.3, 8],
        returnTime: [N_DEFAULTS.returnTime, 0.3, 8],
        sweep: [N_DEFAULTS.sweep, 0, 1],
      },
      flowAndTrails: {
        swirl: [N_DEFAULTS.swirl, 0, 3],
        turbulence: [N_DEFAULTS.turbulence, 0.2, 4],
        flowSpeed: [N_DEFAULTS.flowSpeed, 0, 2],
        trail: [N_DEFAULTS.trail, 0, 2],
      },
      densityAndLook: {
        _collapsed: true,
        shape: {
          type: "select",
          options: [
            { value: "n", label: "N" },
            { value: "coin", label: "Coin" },
          ],
          default: N_DEFAULTS.shape,
        },
        particles: {
          type: "select",
          options: ["20000", "40000", "80000"],
          default: String(N_DEFAULTS.particles),
        },
        dotSize: [N_DEFAULTS.dotSize, 0.5, 4],
        strokes: [N_DEFAULTS.strokes, 0, 0.5],
        ink: N_DEFAULTS.ink,
        grain: [N_DEFAULTS.grain, 0, 1],
      },
      camera: {
        _collapsed: true,
        orbit: [N_DEFAULTS.orbit, -90, 90],
        tilt: [N_DEFAULTS.tilt, -40, 40],
        zoom: [N_DEFAULTS.zoom, 0.6, 1.8],
        autoRotate: N_DEFAULTS.autoRotate,
        rotateSpeed: [N_DEFAULTS.rotateSpeed, 0, 1],
      },
    },
    {
      id: "n-particles",
      onAction: (path) => {
        if (path === "replay") setReplay((count) => count + 1);
      },
    },
  );

  const settings = {
    loop: values.loop,
    ...values.scatterAndReturn,
    ...values.flowAndTrails,
    ...values.densityAndLook,
    ...values.camera,
    shape: values.densityAndLook.shape as Shape,
    particles: Number(values.densityAndLook.particles),
  };

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <Link
          href="/?filter=explorations"
          className={styles.close}
          aria-label="Close the lab"
          onClick={(event) => {
            if (
              document.referrer &&
              new URL(document.referrer).origin === window.location.origin
            ) {
              event.preventDefault();
              router.back();
            }
          }}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </Link>
        <p className={styles.eyebrow}>NLab</p>
        <h1 className={styles.title}>Particles</h1>
        <p className={styles.credit}>
          Inspired by{" "}
          <a
            href="https://heyneuma.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Neuma
          </a>{" "}
          by{" "}
          <a
            href="https://x.com/krispuckett"
            target="_blank"
            rel="noopener noreferrer"
          >
            @krispuckett
          </a>
        </p>
      </header>
      <NParticles
        className={styles.stage}
        settings={settings}
        replay={replay}
      />
      <aside className={styles.dials} aria-label="Dials">
        <DialRoot mode="inline" theme="light" productionEnabled />
      </aside>
    </div>
  );
}
