"use client";

import Script from "next/script";
import shell from "../studio.module.css";
import styles from "./lab.module.css";

declare global {
  interface Window {
    __signalLab?: () => void;
  }
}

export default function LabStage() {
  return (
    <div className={`${styles.lab} ${shell.lock} ${shell.scrollNarrow}`}>
      <aside className={styles.side}>
        <p className={styles.lede}>
          Seven rules, endless outcomes. Every poster here is drawn live in your
          browser from a seed number. Reroll until something stops you.
        </p>
        <nav className={styles.rules} id="rules" aria-label="Rules" />
      </aside>

      <main className={styles.main}>
        <div className={styles.stage}>
          <canvas
            id="cv"
            width="600"
            height="750"
            aria-label="Generated poster"
            className={styles.canvas}
          />
        </div>
        <div className={styles.bar}>
          <div className={styles.meta}>
            <b id="name" className={styles.name}>
              &mdash;
            </b>
          </div>
          <div className={styles.ctrls}>
            <button
              type="button"
              className={styles.btn}
              id="anim"
              aria-pressed="false"
            >
              Animate
            </button>
            <button type="button" className={styles.btn} id="copy">
              Copy link
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnMain}`}
              id="reroll"
            >
              Reroll &#8635;
            </button>
          </div>
        </div>
      </main>

      <aside className={styles.panel} aria-label="Inputs">
        <p className={styles.panelTitle}>Inputs</p>
        <div className={styles.dials} id="dials" />
        <button type="button" className={styles.reset} id="dreset">
          Reset inputs
        </button>
      </aside>

      <div className={styles.toast} id="toast" hidden />
      <Script
        src="/studio/lab.js"
        strategy="afterInteractive"
        onReady={() => window.__signalLab?.()}
      />
    </div>
  );
}
