import "./fonts";
import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  EASE,
  INK,
  LOCKUP,
  LOCKUP_FROM,
  MUTED,
  PAPER,
  SHOTS,
  STARTS,
  framesOf,
  type Shot,
} from "./brand";
import { Soundtrack } from "./Soundtrack";

const ease = Easing.bezier(...EASE);

function Counter({ shot, prev }: { shot: Shot; prev: number }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const n = Math.round(prev + (shot.num - prev) * t);
  const label = t >= 1 ? shot.year : String(n);
  const titleIn = interpolate(frame, [2, 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        right: 50,
        top: 26,
        height: 66,
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        color: shot.ink,
      }}
    >
      <span
        style={{
          fontFamily: '"Geist Mono", monospace',
          fontWeight: 500,
          fontSize: 60,
          letterSpacing: "-0.04em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: '"Geist", sans-serif',
          fontWeight: 500,
          fontSize: 30,
          letterSpacing: "-0.01em",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 8}px)`,
        }}
      >
        {shot.title}
      </span>
    </div>
  );
}

function ShotView({ shot, prev }: { shot: Shot; prev: number }) {
  const rate = shot.rate ?? 1;
  return (
    <AbsoluteFill style={{ background: shot.bg }}>
      <OffthreadVideo
        src={staticFile(`history-of-ui/clips/${shot.id}.mp4`)}
        trimBefore={Math.round(shot.from * 30)}
        playbackRate={rate}
        muted
        style={{ width: "100%", height: "100%" }}
      />
      <Counter shot={shot} prev={prev} />
    </AbsoluteFill>
  );
}

function Mark({ size }: { size: number }) {
  return (
    <svg
      viewBox="18 18 27 27"
      width={size}
      height={size}
      fill={INK}
      aria-hidden
    >
      <path d="M45 45L32 31.2985V18H45V45Z" />
      <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
    </svg>
  );
}

function Lockup() {
  const frame = useCurrentFrame();
  const appear = (delay: number) => {
    const p = interpolate(frame, [delay, delay + 8], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease,
    });
    return { opacity: p, transform: `translateY(${(1 - p) * 18}px)` };
  };
  const out = interpolate(frame, [LOCKUP - 8, LOCKUP], [1, 0.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: PAPER,
        color: INK,
        fontFamily: '"Geist", sans-serif',
        padding: "0 90px",
        justifyContent: "center",
      }}
    >
      <div style={{ opacity: out }}>
        <div style={appear(0)}>
          <Mark size={96} />
        </div>
        <div
          style={{
            ...appear(2),
            fontSize: 132,
            fontWeight: 600,
            letterSpacing: "-0.05em",
            lineHeight: 0.95,
            marginTop: 44,
          }}
        >
          A history of UI
        </div>
        <div
          style={{
            ...appear(4),
            fontSize: 38,
            lineHeight: 1.25,
            color: MUTED,
            marginTop: 30,
            maxWidth: 920,
          }}
        >
          Sixty years of interfaces.
        </div>
        <div
          style={{
            ...appear(6),
            fontFamily: '"Geist Mono", monospace',
            fontSize: 30,
            marginTop: 64,
            paddingTop: 28,
            borderTop: `2px solid ${INK}`,
            display: "inline-block",
          }}
        >
          neilmcardle.com
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function HistoryFilm() {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SHOTS.map((shot, i) => (
        <Sequence
          key={shot.id}
          from={STARTS[i]}
          durationInFrames={framesOf(shot)}
        >
          <ShotView shot={shot} prev={i === 0 ? 1950 : SHOTS[i - 1].num} />
        </Sequence>
      ))}
      <Sequence from={LOCKUP_FROM} durationInFrames={LOCKUP}>
        <Lockup />
      </Sequence>
      <Soundtrack />
    </AbsoluteFill>
  );
}
