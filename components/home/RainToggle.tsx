"use client";

import { useEffect, useState } from "react";
import { MarkEdge, MarkPlate } from "./ProductBadge";
import * as rain from "./rainAudio";
import styles from "./home.module.css";

const SHADOW_MATRIX = "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0";
const SHADOW_COLOUR = "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0";

const PLAY =
  "M47.4223 27.9777C48.8964 28.7147 48.8964 30.8183 47.4223 31.5554L21.8944 44.3193C20.5646 44.9842 19 44.0172 19 42.5304V17.0026C19 15.5158 20.5646 14.5488 21.8944 15.2137L47.4223 27.9777Z";

export default function RainToggle() {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(rain.enabled());
    const unsubscribe = rain.subscribe(setPlaying);
    void rain.resume();
    return () => {
      unsubscribe();
      rain.suspend();
    };
  }, []);

  return (
    <button
      type="button"
      className={styles.rainToggle}
      aria-pressed={playing}
      aria-label={playing ? "Stop raining" : "Let it rain"}
      onClick={() => {
        if (playing) rain.stop();
        else void rain.start();
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 63 63"
        fill="none"
        aria-hidden="true"
      >
        <MarkPlate id="rainmark" />

        {playing ? (
          <g filter="url(#rainmark-drop)">
            <rect
              x="16"
              y="14.5"
              width="11"
              height="33"
              rx="4"
              fill="#D9D9D9"
            />
            <rect
              x="37"
              y="14.5"
              width="11"
              height="33"
              rx="4"
              fill="#D9D9D9"
            />
          </g>
        ) : (
          <g filter="url(#rainmark-drop)">
            <path d={PLAY} fill="#D9D9D9" />
          </g>
        )}

        <defs>
          <MarkEdge id="rainmark" />
          <filter
            id="rainmark-drop"
            x="12"
            y="12.5"
            width="41"
            height="41"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="bg" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values={SHADOW_MATRIX}
              result="hardAlpha"
            />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values={SHADOW_COLOUR} />
            <feBlend mode="normal" in2="bg" result="drop" />
            <feBlend mode="normal" in="SourceGraphic" in2="drop" />
          </filter>
        </defs>
      </svg>

      <span className={styles.rainTip} role="tooltip">
        {playing ? "Stop raining" : "Let it rain"}
      </span>
    </button>
  );
}
