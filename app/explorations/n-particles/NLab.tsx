"use client";

import { useState } from "react";
import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";
import NParticles, {
  N_DEFAULTS,
  type Shape,
} from "@/app/explorations/_lab/NParticles";
import styles from "./lab.module.css";

export default function NLab() {
  const [replay, setReplay] = useState(0);
  const values = useDialKit(
    "N particles",
    {
      Replay: { type: "action", label: "Replay" },
      Loop: N_DEFAULTS.loop,
      "Scatter and return": {
        Distance: [N_DEFAULTS.distance, 0, 4],
        Hold: [N_DEFAULTS.hold, 0, 5],
        "Scatter time": [N_DEFAULTS.scatterTime, 0.3, 8],
        "Return time": [N_DEFAULTS.returnTime, 0.3, 8],
        Sweep: [N_DEFAULTS.sweep, 0, 1],
      },
      "Flow and trails": {
        Swirl: [N_DEFAULTS.swirl, 0, 3],
        Turbulence: [N_DEFAULTS.turbulence, 0.2, 4],
        "Flow speed": [N_DEFAULTS.flowSpeed, 0, 2],
        Trail: [N_DEFAULTS.trail, 0, 2],
      },
      "Density and look": {
        _collapsed: true,
        Shape: {
          type: "select",
          options: [
            { value: "n", label: "N" },
            { value: "coin", label: "Coin" },
          ],
          default: N_DEFAULTS.shape,
        },
        Particles: {
          type: "select",
          options: [
            { value: "20000", label: "20,000" },
            { value: "40000", label: "40,000" },
            { value: "80000", label: "80,000" },
          ],
          default: String(N_DEFAULTS.particles),
        },
        "Dot size": [N_DEFAULTS.dotSize, 0.5, 4],
        Strokes: [N_DEFAULTS.strokes, 0, 0.5],
        Ink: N_DEFAULTS.ink,
        Grain: [N_DEFAULTS.grain, 0, 1],
      },
      Camera: {
        _collapsed: true,
        Orbit: [N_DEFAULTS.orbit, -90, 90],
        Tilt: [N_DEFAULTS.tilt, -40, 40],
        Zoom: [N_DEFAULTS.zoom, 0.6, 1.8],
        "Auto rotate": N_DEFAULTS.autoRotate,
        "Rotate speed": [N_DEFAULTS.rotateSpeed, 0, 1],
      },
    },
    {
      id: "n-particles-systems",
      onAction: (path) => {
        if (path === "Replay") setReplay((count) => count + 1);
      },
    },
  );

  const scatter = values["Scatter and return"];
  const flow = values["Flow and trails"];
  const look = values["Density and look"];
  const camera = values["Camera"];

  const settings = {
    ...N_DEFAULTS,
    loop: values["Loop"],
    distance: scatter["Distance"],
    hold: scatter["Hold"],
    scatterTime: scatter["Scatter time"],
    returnTime: scatter["Return time"],
    sweep: scatter["Sweep"],
    swirl: flow["Swirl"],
    turbulence: flow["Turbulence"],
    flowSpeed: flow["Flow speed"],
    trail: flow["Trail"],
    shape: look["Shape"] as Shape,
    particles: Number(look["Particles"]),
    dotSize: look["Dot size"],
    strokes: look["Strokes"],
    ink: look["Ink"],
    grain: look["Grain"],
    orbit: camera["Orbit"],
    tilt: camera["Tilt"],
    zoom: camera["Zoom"],
    autoRotate: camera["Auto rotate"],
    rotateSpeed: camera["Rotate speed"],
  };

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>N particles</h1>
        <p className={styles.lede}>
          <span className={styles.subject}>My N mark as 40,000 particles</span>{" "}
          that blow away on a soft wind and settle back into shape. Every dial
          changes it live.
        </p>
      </header>
      <figure className={styles.figure}>
        <NParticles
          className={styles.stage}
          settings={settings}
          replay={replay}
        />
        <figcaption className={styles.caption}>
          Drag to turn the mark. Replay sends it out again. I made it after
          seeing{" "}
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
            Kris Puckett
          </a>
          .
        </figcaption>
      </figure>
      <aside className={styles.dials} aria-label="Dials">
        <DialRoot mode="inline" theme="dark" productionEnabled />
      </aside>
    </main>
  );
}
