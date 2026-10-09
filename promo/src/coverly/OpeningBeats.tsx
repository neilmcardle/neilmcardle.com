import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLOR, DISPLAY, FONT, LOGOMARK_PATH, LOGOMARK_VIEWBOX } from "./brand";
import { COVERLY_COVERS } from "./covers";
import { CropMarks } from "./CropMarks";

const COLUMNS = 12;
const PER_COLUMN = 6;
const COLUMN_WIDTH = 156;
const GAP = 16;
const COVER_HEIGHT = COLUMN_WIDTH * 1.5 + GAP;

function Column({ index, frame }: { index: number; frame: number }) {
  const covers = Array.from(
    { length: PER_COLUMN },
    (_, k) => COVERLY_COVERS[(index * PER_COLUMN + k) % 32],
  );
  const loop = PER_COLUMN * COVER_HEIGHT;
  const speed = 1.4 + (index % 4) * 0.35;
  const up = index % 2 === 0;
  const travel = (frame * speed) % loop;
  const y = up ? -travel : travel - loop;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: COLUMN_WIDTH,
        transform: `translateY(${y}px)`,
      }}
    >
      {[...covers, ...covers, ...covers].map((cover, k) => (
        <div
          key={k}
          style={{
            width: COLUMN_WIDTH,
            height: COLUMN_WIDTH * 1.5,
            marginBottom: GAP,
            borderRadius: 8,
            overflow: "hidden",
            background: cover.color,
            boxShadow:
              "0 24px 48px -24px rgb(0 0 0 / 0.8), inset 0 0 0 2px rgb(255 255 255 / 0.1)",
          }}
        >
          <Img
            src={cover.src}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ))}
    </div>
  );
}

export function Dark() {
  const frame = useCurrentFrame();
  const draw = [0, 1, 2, 3].map((i) =>
    interpolate(frame, [1 + i * 15, 9 + i * 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );
  return (
    <AbsoluteFill style={{ background: COLOR.lightbox }}>
      <CropMarks color={COLOR.paper} opacity={0.55} draw={draw} />
    </AbsoluteFill>
  );
}

export function Wall() {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, 120], [1, 1.12], {
    easing: Easing.inOut(Easing.sin),
  });
  const handoff = interpolate(frame, [104, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const reveal = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const lockup = interpolate(frame, [10, 48], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  return (
    <AbsoluteFill style={{ background: COLOR.lightbox, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <AbsoluteFill style={{ opacity: reveal }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              display: "flex",
              gap: GAP,
              transform: "translate(-50%, -50%) rotate(-16deg) scale(1.25)",
            }}
          >
            {Array.from({ length: COLUMNS }, (_, i) => (
              <Column key={i} index={i} frame={400} />
            ))}
          </div>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse at center, rgb(11 11 12 / 0.55) 0%, rgb(11 11 12 / 0.86) 62%, rgb(11 11 12 / 0.96) 100%)",
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            gap: 30,
            color: COLOR.paper,
            opacity: lockup,
          }}
        >
          <svg width={176} viewBox={LOGOMARK_VIEWBOX}>
            <path d={LOGOMARK_PATH} fill="currentColor" />
          </svg>
          <div
            style={{
              ...DISPLAY,
              fontSize: 80,
              letterSpacing: "0.01em",
              lineHeight: 1,
            }}
          >
            coverly
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <CropMarks color={COLOR.paper} opacity={0.55} />
      <AbsoluteFill style={{ background: COLOR.booth, opacity: handoff }} />
    </AbsoluteFill>
  );
}
