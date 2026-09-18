import { useId } from "react";
import styles from "./home.module.css";

const EYES = [
  { x: 83.1, y: 63.3, rotate: -4.05, cx: 94.6, cy: 79.5 },
  { x: 127.6, y: 57, rotate: -12.85, cx: 139.1, cy: 73.2 },
];

export default function CurlMind() {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      className={styles.curlMind}
      viewBox="0 0 180 180"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient
          id={`${id}-ball`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(90 72.875) rotate(90) scale(97.625)"
        >
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#deea53" />
          <stop offset="0.77" stopColor="#a7b03e" />
          <stop offset="1" stopColor="#51533e" />
        </radialGradient>
        {EYES.map((eye, i) => (
          <radialGradient
            key={i}
            id={`${id}-eye-${i}`}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform={`translate(${eye.cx} ${eye.cy}) rotate(90) scale(21.6 12.8)`}
          >
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.1" stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#000000" />
          </radialGradient>
        ))}
      </defs>
      <circle cx="90" cy="88" r="88" fill={`url(#${id}-ball)`} />
      <g className={styles.curlMindEyes}>
        {EYES.map((eye, i) => (
          <g key={i} className={styles.curlMindEye}>
            <rect
              x={eye.x}
              y={eye.y}
              width="23"
              height="39"
              rx="11.5"
              transform={`rotate(${eye.rotate} ${eye.x} ${eye.y})`}
              fill={`url(#${id}-eye-${i})`}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
