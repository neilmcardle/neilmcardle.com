"use client";

import Script from "next/script";
import shell from "../studio.module.css";
import styles from "./lab.module.css";

export default function LabStage() {
  return (
    <div className={`${styles.lab} ${shell.lock}`}>
      <aside className={styles.side}>
        <p className={styles.lede}>
          Seven rules, endless outcomes. Every poster here is drawn live in your
          browser from a seed number. Reroll until something stops you.
        </p>
        <nav className={styles.rules} id="rules" aria-label="Rules" />
        <div className={styles.keys}>
          <kbd className={styles.key}>Space</kbd> reroll
          <br />
          <kbd className={styles.key}>&larr;</kbd>{" "}
          <kbd className={styles.key}>&rarr;</kbd> change rule
          <br />
          <kbd className={styles.key}>A</kbd> animate
        </div>
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
            <span id="recipe" className={styles.recipe} />
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

      <div className={styles.toast} id="toast" hidden />
      <Script src="/studio/lab.js" strategy="afterInteractive" />
    </div>
  );
}
