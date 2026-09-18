"use client";

import React, { useEffect, useId, useState } from "react";
import styles from "../../styles/studio.module.css";

interface BookMindMarkProps {
  className?: string;
  thinking?: boolean;
}

const EYE_STOPS = [
  { offset: 0, color: "#ffffff" },
  { offset: 0.505, color: "#deea53" },
  { offset: 0.774, color: "#a7b03e" },
  { offset: 1, color: "#51533e" },
];

export default function BookMindMark({
  className,
  thinking = false,
}: BookMindMarkProps) {
  const id = useId().replace(/:/g, "");
  const [wasThinking, setWasThinking] = useState(thinking);
  const [answered, setAnswered] = useState(false);

  if (wasThinking !== thinking) {
    setWasThinking(thinking);
    setAnswered(wasThinking && !thinking);
  }

  useEffect(() => {
    if (!answered) return;
    const t = setTimeout(() => setAnswered(false), 1000);
    return () => clearTimeout(t);
  }, [answered]);

  const state = thinking ? "thinking" : answered ? "answered" : "idle";

  return (
    <svg
      className={`${styles.mindMark} ${className ?? ""}`}
      data-state={state}
      viewBox="0 0 176 176"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient
          id={`${id}-ball`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(88 34.2222) rotate(90) scale(128.278)"
        >
          <stop stopColor="#565656" />
          <stop offset="0.485577" stopColor="#444444" />
          <stop offset="0.951923" stopColor="#000000" />
        </radialGradient>
        {[
          ["l", "translate(92.6096 79.4821)"],
          ["r", "translate(137.064 73.1804)"],
        ].map(([side, at]) => (
          <radialGradient
            key={side}
            id={`${id}-eye-${side}`}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform={`${at} rotate(90) scale(21.6328 12.7578)`}
          >
            {EYE_STOPS.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </radialGradient>
        ))}
        <filter
          id={`${id}-shade`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="1"
            floodColor="#000"
            floodOpacity="0.5"
          />
        </filter>
      </defs>
      <g className={styles.mindBall}>
        <circle cx="88" cy="88" r="88" fill={`url(#${id}-ball)`} />
        <g className={styles.mindEyes}>
          <g className={styles.mindEye} filter={`url(#${id}-shade)`}>
            <rect
              x="81.1096"
              y="63.3336"
              width="23"
              height="39"
              rx="11.5"
              transform="rotate(-4.05442 81.1096 63.3336)"
              fill={`url(#${id}-eye-l)`}
            />
          </g>
          <g className={styles.mindEye} filter={`url(#${id}-shade)`}>
            <rect
              x="125.564"
              y="57.032"
              width="23"
              height="39"
              rx="11.5"
              transform="rotate(-12.8462 125.564 57.032)"
              fill={`url(#${id}-eye-r)`}
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
