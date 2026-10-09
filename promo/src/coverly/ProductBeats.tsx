import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLOR, FAN, FAN_COVERS, FONT, SETTLE } from "./brand";
import { COVERLY_COVERS } from "./covers";
import { CropMarks } from "./CropMarks";

const settle = Easing.bezier(...SETTLE);

export function Deal() {
  const frame = useCurrentFrame();
  const coverWidth = 330;
  return (
    <AbsoluteFill style={{ background: COLOR.booth }}>
      <CropMarks color={COLOR.press} opacity={0.45} />
      {FAN_COVERS.map((src, i) => {
        const start = Math.abs(i - 2) * 15 - 1;
        const t = interpolate(frame, [start, start + 11], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: settle,
        });
        const drift = interpolate(frame, [30, 60], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const fan = FAN[i];
        const x = fan.x * t * (1 + drift * 0.03);
        const y = fan.y * t;
        const r = fan.rotate * t * (1 + drift * 0.04);
        return (
          <div
            key={src}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: coverWidth,
              aspectRatio: "2 / 3",
              marginTop: -20,
              borderRadius: 6,
              overflow: "hidden",
              opacity: interpolate(t, [0, 0.06], [0, 1], {
                extrapolateRight: "clamp",
              }),
              transform: `translate(calc(-50% + ${x}%), calc(-50% + ${y}%)) rotate(${r}deg) scale(${0.92 + 0.08 * t})`,
              zIndex: i === 2 ? 3 : i === 1 || i === 3 ? 2 : 1,
              boxShadow:
                "0 44px 80px -36px rgb(0 0 0 / 0.55), 0 4px 12px rgb(0 0 0 / 0.18)",
            }}
          >
            <Img
              src={src}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

const BODY = { width: 1200, height: 600 };
const GRID_COVER = 180;
const GRID_GAP = 16;
const SHELF_GAP = 10;
const SHELF_ROW = (BODY.height - 20) / 2;
export const VIEW_COVERS = COVERLY_COVERS.slice(8, 20);
export const PICK = 8;
export const BODY_ORIGIN = { x: 360, y: 290 };

type Rect = { x: number; y: number; w: number; h: number };

function gridRect(i: number): Rect {
  const col = i % 6;
  const row = Math.floor(i / 6);
  const total = 6 * GRID_COVER + 5 * GRID_GAP;
  const height = 2 * GRID_COVER * 1.5 + GRID_GAP;
  return {
    x: (BODY.width - total) / 2 + col * (GRID_COVER + GRID_GAP),
    y: (BODY.height - height) / 2 + row * (GRID_COVER * 1.5 + GRID_GAP),
    w: GRID_COVER,
    h: GRID_COVER * 1.5,
  };
}

function shelfRects(): Rect[] {
  const rects: Rect[] = [];
  for (let r = 0; r < 2; r += 1) {
    const widths = Array.from(
      { length: 6 },
      (_, j) => (BODY.width * (12 + ((j * 3 + r * 2) % 5))) / 100,
    ).map((w) => Math.min(w, (SHELF_ROW - 8) / 1.5));
    const total = widths.reduce((a, b) => a + b, 0) + 5 * SHELF_GAP;
    let x = (BODY.width - total) / 2;
    const floor = r * (SHELF_ROW + 20) + SHELF_ROW;
    widths.forEach((w) => {
      rects.push({ x, y: floor - w * 1.5, w, h: w * 1.5 });
      x += w + SHELF_GAP;
    });
  }
  return rects;
}

export const SHELVES = shelfRects();

export function Cursor({
  x,
  y,
  press,
}: {
  x: number;
  y: number;
  press: number;
}) {
  return (
    <svg
      width={44}
      height={44}
      viewBox="0 0 24 24"
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${1 - press * 0.12})`,
        transformOrigin: "4px 3px",
        filter: "drop-shadow(0 4px 8px rgb(0 0 0 / 0.25))",
      }}
    >
      <path
        d="M4 3l14 9-6.2 1.4L15 20l-2.6 1.2-3.2-6.6L4 18.6z"
        fill={COLOR.press}
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Views() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const CLICK = 55;
  const toggle = interpolate(frame, [CLICK, CLICK + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cursorIn = interpolate(frame, [28, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const press = interpolate(frame, [CLICK - 2, CLICK, CLICK + 4], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panel = { width: 1360, height: 820 };
  const panelLeft = (1920 - panel.width) / 2;
  const panelTop = (1080 - panel.height) / 2;
  const segLeft = panelLeft + panel.width / 2 - 140;
  const segTop = panelTop + 44;
  const pick = SHELVES[PICK];
  const pickX = BODY_ORIGIN.x + pick.x + pick.w * 0.55;
  const pickY = BODY_ORIGIN.y + pick.y + pick.h * 0.45;
  const toPick = interpolate(frame, [86, 102], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const cursorX = interpolate(
    toPick,
    [0, 1],
    [interpolate(cursorIn, [0, 1], [1500, segLeft + 196]), pickX],
  );
  const cursorY = interpolate(
    toPick,
    [0, 1],
    [interpolate(cursorIn, [0, 1], [960, segTop + 22]), pickY],
  );
  const pickPress = interpolate(frame, [103, 105, 109], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shelfLine = interpolate(frame, [57, 66], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLOR.paper }}>
      <CropMarks color={COLOR.press} opacity={0.45} />
      <div
        style={{
          position: "absolute",
          left: panelLeft,
          top: panelTop,
          width: panel.width,
          height: panel.height,
          borderRadius: 16,
          background: "#FBFAF7",
          boxShadow:
            "0 0 0 2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06), 0 4px 8px rgb(0 0 0 / 0.04)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: panel.width / 2 - 140,
            top: 44,
            display: "flex",
            width: 280,
            height: 60,
            padding: 4,
            borderRadius: 999,
            background: "rgb(18 18 18 / 0.08)",
            fontFamily: FONT.ui,
            fontWeight: 500,
            fontSize: 24,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 4,
              left: 4 + toggle * 128,
              width: 120 + toggle * 24,
              height: 52,
              borderRadius: 999,
              background: COLOR.press,
            }}
          />
          {["Grid", "Bookshelf"].map((label, k) => {
            const on = k === 0 ? 1 - toggle : toggle;
            return (
              <div
                key={label}
                style={{
                  position: "relative",
                  width: k === 0 ? 124 : 148,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: on > 0.5 ? COLOR.paper : COLOR.press,
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            left: (panel.width - BODY.width) / 2,
            top: 160,
            width: BODY.width,
            height: BODY.height,
          }}
        >
          {[0, 1].map((r) => (
            <div
              key={r}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: r * (SHELF_ROW + 20) + SHELF_ROW,
                height: 6,
                background: "rgb(18 18 18 / 0.35)",
                transformOrigin: "50% 50%",
                transform: `scaleX(${shelfLine})`,
                opacity: shelfLine,
              }}
            />
          ))}
          {VIEW_COVERS.map((cover, i) => {
            const land = spring({
              frame: frame - (Math.floor(i / 6) * 15 + (i % 6)),
              fps,
              config: { damping: 12, stiffness: 160, mass: 0.6 },
            });
            const move = spring({
              frame: frame - (56 + i * 0.5),
              fps,
              config: { damping: 16, stiffness: 260, mass: 0.6 },
            });
            const a = gridRect(i);
            const b = SHELVES[i];
            const x = a.x + (b.x - a.x) * move;
            const y = a.y + (b.y - a.y) * move;
            const w = a.w + (b.w - a.w) * move;
            const h = a.h + (b.h - a.h) * move;
            return (
              <div
                key={cover.src}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: w,
                  height: h,
                  borderRadius: 4,
                  overflow: "hidden",
                  background: cover.color,
                  opacity: Math.min(1, land * 1.4),
                  transform: `translateY(${(1 - land) * -20}px) scale(${0.94 + 0.06 * land})`,
                  boxShadow: "0 12px 24px -12px rgb(0 0 0 / 0.5)",
                  outline:
                    i === PICK && toPick > 0.6
                      ? "4px solid rgb(18 18 18 / 0.25)"
                      : "4px solid transparent",
                  outlineOffset: 4,
                }}
              >
                <Img
                  src={cover.src}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            );
          })}
        </div>
      </div>
      {frame >= 20 ? (
        <Cursor x={cursorX} y={cursorY} press={Math.max(press, pickPress)} />
      ) : null}
    </AbsoluteFill>
  );
}
