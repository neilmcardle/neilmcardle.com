import styles from "./coverly.module.css";

const COLS = 5;

const COL_STYLE = [
  { dir: "up", duration: 260, delay: -40 },
  { dir: "down", duration: 224, delay: -110 },
  { dir: "up", duration: 300, delay: -175 },
  { dir: "down", duration: 244, delay: -70 },
  { dir: "up", duration: 280, delay: -140 },
] as const;

const PALETTES = [
  { bg: "#12161d", accent: "#e2b447", ink: "#f4f1ea" },
  { bg: "#1d1013", accent: "#c8452f", ink: "#f6efe6" },
  { bg: "#0f1a1c", accent: "#4fb3a5", ink: "#eef6f4" },
  { bg: "#191527", accent: "#8a6fd1", ink: "#f1edf9" },
  { bg: "#1c1a12", accent: "#d98c34", ink: "#f7f2e4" },
  { bg: "#101418", accent: "#6f95c9", ink: "#eaf1f8" },
  { bg: "#1a1116", accent: "#d4557f", ink: "#f8ecf1" },
  { bg: "#141c15", accent: "#7fae52", ink: "#eff6ea" },
];

function rand(seed: number, salt: number) {
  const x = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function StylisedCover({ i }: { i: number }) {
  const p = PALETTES[i % PALETTES.length];
  const layout = Math.floor(rand(i, 1) * 4);
  const titleLines = 1 + Math.floor(rand(i, 2) * 2);
  const rot = (rand(i, 3) - 0.5) * 2;

  return (
    <svg
      viewBox="0 0 200 300"
      className="mb-2 w-full rounded-lg shadow-xl ring-1 ring-white/10"
      style={{ aspectRatio: "2 / 3", display: "block" }}
      aria-hidden="true"
    >
      <rect width="200" height="300" fill={p.bg} />

      {layout === 0 && (
        <g opacity="0.9">
          <circle
            cx={60 + rand(i, 4) * 80}
            cy={90 + rand(i, 5) * 60}
            r={38 + rand(i, 6) * 30}
            fill={p.accent}
            opacity="0.55"
          />
          <path
            d={`M0,${200 + rand(i, 7) * 40} L200,${150 + rand(i, 8) * 60} L200,300 L0,300 Z`}
            fill={p.accent}
            opacity="0.18"
          />
        </g>
      )}

      {layout === 1 && (
        <>
          <rect
            x="16"
            y="16"
            width="168"
            height="268"
            fill="none"
            stroke={p.accent}
            strokeWidth="2"
            opacity="0.7"
          />
          <rect
            x="34"
            y="60"
            width="132"
            height="120"
            fill={p.accent}
            opacity="0.4"
          />
        </>
      )}

      {layout === 2 && (
        <g opacity="0.5">
          <rect
            x="0"
            y={120 + rand(i, 9) * 40}
            width="200"
            height="3"
            fill={p.accent}
          />
          <rect
            x="0"
            y={140 + rand(i, 9) * 40}
            width="200"
            height="3"
            fill={p.accent}
          />
        </g>
      )}

      {layout === 3 && (
        <g transform={`rotate(${rot * 8} 100 140)`}>
          <rect
            x="70"
            y="70"
            width="60"
            height="140"
            rx="4"
            fill={p.accent}
            opacity="0.65"
          />
          <rect x="82" y="92" width="36" height="4" fill={p.bg} opacity="0.8" />
        </g>
      )}

      {Array.from({ length: titleLines }).map((_, l) => (
        <rect
          key={l}
          x="22"
          y={218 + l * 18}
          width={(l === titleLines - 1 ? 100 : 150) + rand(i, 10 + l) * 26}
          height="10"
          rx="2"
          fill={p.ink}
          opacity="0.92"
        />
      ))}
      <rect
        x="22"
        y={218 + titleLines * 18 + 12}
        width="64"
        height="5"
        rx="2"
        fill={p.ink}
        opacity="0.45"
      />
    </svg>
  );
}

export function CoverMarquee() {
  const columns: number[][] = Array.from({ length: COLS }, () => []);
  for (let i = 0; i < 40; i++) columns[i % COLS].push(i);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`${styles.field} absolute left-1/2 top-1/2 flex gap-2`}>
        {columns.map((col, i) => {
          const { dir, duration, delay } = COL_STYLE[i % COL_STYLE.length];
          const loop = [...col, ...col, ...col];
          return (
            <div
              key={i}
              className={`${styles.col} ${dir === "up" ? styles.up : styles.down} flex w-[120px] flex-col`}
              style={{
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              }}
            >
              {loop.map((n, j) => (
                <StylisedCover key={`${i}-${j}`} i={n} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
