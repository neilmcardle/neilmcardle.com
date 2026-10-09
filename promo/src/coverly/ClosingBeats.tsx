import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CATALOGUE_TOTAL,
  COLOR,
  DISPLAY,
  FONT,
  LOGOMARK_PATH,
  LOGOMARK_VIEWBOX,
} from "./brand";
import { CropMarks } from "./CropMarks";

const rise = (frame: number, start: number, length = 14) =>
  interpolate(frame, [start, start + length], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

export function Spec() {
  const frame = useCurrentFrame();
  const count = Math.round(
    interpolate(frame, [0, 18], [0, CATALOGUE_TOTAL], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );
  const label = rise(frame, 15, 8);
  return (
    <AbsoluteFill style={{ background: COLOR.paper }}>
      <CropMarks color={COLOR.press} opacity={0.45} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          color: COLOR.press,
        }}
      >
        <div
          style={{
            ...DISPLAY,
            fontSize: 336,
            lineHeight: "300px",
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count.toLocaleString("en-GB")}
        </div>
        <div
          style={{
            fontFamily: FONT.ui,
            fontSize: 108,
            lineHeight: "116px",
            letterSpacing: "-0.01em",
            opacity: label,
            transform: `translateY(${(1 - label) * 14}px)`,
          }}
        >
          cover designs
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function Lockup() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mark = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 320, mass: 0.5 },
  });
  const word = rise(frame, 0, 8);
  const inset = interpolate(frame, [0, 16], [72, 132], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const fade = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  return (
    <AbsoluteFill style={{ background: COLOR.paper }}>
      <AbsoluteFill
        style={{ background: COLOR.lightbox, opacity: fade, zIndex: 2 }}
      />
      <CropMarks color={COLOR.press} opacity={0.45} inset={inset} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          color: COLOR.press,
        }}
      >
        <svg
          width={128}
          height={128}
          viewBox={LOGOMARK_VIEWBOX}
          style={{
            transform: `scale(${mark}) rotate(${(1 - mark) * -45}deg)`,
          }}
        >
          <path d={LOGOMARK_PATH} fill={COLOR.press} />
        </svg>
        <div
          style={{
            ...DISPLAY,
            fontSize: 176,
            lineHeight: "160px",
            letterSpacing: "-0.02em",
            opacity: word,
            transform: `translateY(${(1 - word) * 14}px)`,
          }}
        >
          coverly
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
