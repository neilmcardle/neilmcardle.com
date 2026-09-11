"use client";

import { useEffect, useState } from "react";
import styles from "./home.module.css";

const LONDON_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const londonTime = () => LONDON_TIME.format(new Date());

export default function LiveSentence() {
  const [play, setPlay] = useState(0);
  const start = () => setPlay((current) => current || Date.now());

  return (
    <div className={styles.sentenceWrap}>
      <h1 className={styles.sentence}>
        Designer in{" "}
        <span className={styles.landmark}>
          <span
            className={styles.london}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") start();
            }}
            onPointerDown={start}
          >
            London
          </span>
          .{play ? <Tower key={play} onDone={() => setPlay(0)} /> : null}
        </span>
      </h1>
    </div>
  );
}

function Tower({ onDone }: { onDone: () => void }) {
  const [time, setTime] = useState(londonTime);

  useEffect(() => {
    const id = window.setInterval(() => setTime(londonTime()), 250);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <span
        className={styles.ben}
        aria-hidden="true"
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) onDone();
        }}
      >
        <span className={styles.benArt} />
      </span>
      <span className={styles.benTime} aria-hidden="true">
        <span className={styles.benTimeText}>{time}</span>
      </span>
    </>
  );
}
