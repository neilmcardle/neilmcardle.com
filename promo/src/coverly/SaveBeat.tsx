import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLOR, FONT } from "./brand";
import { CropMarks } from "./CropMarks";
import {
  BODY_ORIGIN,
  Cursor,
  PICK,
  SHELVES,
  VIEW_COVERS,
} from "./ProductBeats";

const COVER = {
  title: "The Black Orchid: A Novel",
  author: "Loreth Anne White",
  year: "2026",
  imprint: "Montlake",
  isbn: "9781662518928",
  tags: [
    ["Sub-genre", "Psychological"],
    ["Art style", "Photographic"],
    ["Typography", "Sans"],
    ["People", "None"],
    ["Layout", "Full bleed art"],
    ["Tone", "Dark"],
  ],
  palette: ["#fad40c", "#b39f59", "#c0c090", "#445434", "#04547c"],
};

const BOARDS = ["Thriller comps", "Dark palettes"];

const MUTED = "#76746F";
const BORDER = "#E2E1DC";
const LIKE_RED = "#EF4444";

const HERO = { x: 290, y: 200, w: 400, h: 600 };
const INFO_X = 770;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

function Icon({
  d,
  size = 32,
  fill = "none",
  color = "currentColor",
  width = 2,
  children,
}: {
  d?: string;
  size?: number;
  fill?: string;
  color?: string;
  width?: number;
  children?: ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {d ? <path d={d} /> : null}
      {children}
    </svg>
  );
}

const HEART =
  "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z";
const BOOKMARK = "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z";
const CHECK = "M20 6 9 17l-5-5";

export function Save() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const from = SHELVES[PICK];
  const fly = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });
  const heroX = interpolate(fly, [0, 1], [BODY_ORIGIN.x + from.x, HERO.x]);
  const heroY = interpolate(fly, [0, 1], [BODY_ORIGIN.y + from.y, HERO.y]);
  const heroW = interpolate(fly, [0, 1], [from.w, HERO.w]);
  const heroH = interpolate(fly, [0, 1], [from.h, HERO.h]);

  const LIKE = 45;
  const OPEN = 60;
  const PICK_BOARD = 75;

  const liked = frame >= LIKE;
  const pulse = interpolate(
    frame,
    [LIKE, LIKE + 5, LIKE + 12],
    [1, 1.35, 1],
    clamp,
  );
  const pop =
    ease(frame, OPEN, OPEN + 6) *
    (1 - ease(frame, PICK_BOARD + 2, PICK_BOARD + 8));
  const saved = frame >= PICK_BOARD + 4;
  const tab = spring({
    frame: frame - (PICK_BOARD + 15),
    fps,
    config: { damping: 36, stiffness: 420, mass: 0.8 },
  });
  const thumbFly = interpolate(
    frame,
    [PICK_BOARD + 2, PICK_BOARD + 20],
    [0, 1],
    {
      ...clamp,
      easing: Easing.in(Easing.cubic),
    },
  );

  const buttonsY = 760;
  const saveBtn = { x: INFO_X, y: buttonsY, w: 268, h: 72 };
  const TAB_W = 430;
  const likeBtn = { x: INFO_X + 284, y: buttonsY, w: 160, h: 72 };
  const popTop = buttonsY + 84;

  const path: [number, number, number][] = [
    [30, 1640, 900],
    [42, likeBtn.x + 70, likeBtn.y + 40],
    [49, likeBtn.x + 70, likeBtn.y + 40],
    [57, saveBtn.x + 120, saveBtn.y + 40],
    [66, saveBtn.x + 120, saveBtn.y + 40],
    [72, INFO_X + 120, popTop + 100],
    [120, INFO_X + 120, popTop + 100],
  ];
  const frames = path.map((p) => p[0]);
  const cursorX = interpolate(
    frame,
    frames,
    path.map((p) => p[1]),
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const cursorY = interpolate(
    frame,
    frames,
    path.map((p) => p[2]),
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const press = Math.max(
    interpolate(frame, [LIKE - 2, LIKE, LIKE + 4], [0, 1, 0], clamp),
    interpolate(frame, [OPEN - 2, OPEN, OPEN + 4], [0, 1, 0], clamp),
    interpolate(
      frame,
      [PICK_BOARD - 2, PICK_BOARD, PICK_BOARD + 4],
      [0, 1, 0],
      clamp,
    ),
  );

  const camera =
    interpolate(frame, [OPEN - 2, OPEN + 8], [0, -110], {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    }) +
    interpolate(frame, [PICK_BOARD + 8, PICK_BOARD + 24], [0, 110], {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    });

  const reveal = (i: number) =>
    i < 10 ? ease(frame, 15 + i, 25 + i) : ease(frame, 20 + i, 30 + i);
  const rise = (i: number) => ({
    opacity: reveal(i),
    transform: `translateY(${(1 - reveal(i)) * 14}px)`,
  });

  return (
    <AbsoluteFill
      style={{
        background: COLOR.paper,
        fontFamily: FONT.ui,
        color: COLOR.press,
      }}
    >
      <CropMarks color={COLOR.press} opacity={0.45} />
      <AbsoluteFill style={{ transform: `translateY(${camera}px)` }}>
        <div
          style={{
            position: "absolute",
            left: INFO_X,
            top: HERO.y,
            width: 960,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              ...rise(0),
              fontSize: 54,
              fontWeight: 600,
              lineHeight: "62px",
              letterSpacing: "-0.02em",
            }}
          >
            {COVER.title}
          </div>
          <div
            style={{
              ...rise(1),
              marginTop: 14,
              fontSize: 36,
              fontWeight: 500,
              lineHeight: "44px",
            }}
          >
            {COVER.author}
          </div>
          <div
            style={{
              ...rise(2),
              marginTop: 6,
              fontSize: 28,
              lineHeight: "36px",
              color: MUTED,
            }}
          >
            <span style={{ fontFamily: FONT.mono }}>{COVER.year}</span> ·{" "}
            {COVER.imprint}
          </div>
          <div
            style={{
              ...rise(3),
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 24,
              color: MUTED,
              fontFamily: FONT.mono,
            }}
          >
            <Icon size={26} color={MUTED}>
              <rect x="8" y="8" width="14" height="14" rx="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </Icon>
            ISBN {COVER.isbn}
          </div>
          <div
            style={{
              marginTop: 40,
              display: "grid",
              gridTemplateColumns: "repeat(3, 240px)",
              rowGap: 30,
              columnGap: 40,
            }}
          >
            {COVER.tags.map(([label, value], i) => (
              <div key={label} style={rise(4 + i)}>
                <div
                  style={{
                    fontSize: 21,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: MUTED,
                  }}
                >
                  {label}
                </div>
                <div style={{ marginTop: 4, fontSize: 29, fontWeight: 500 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, display: "flex", gap: 16 }}>
            {COVER.palette.map((hex, i) => (
              <div
                key={hex}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  background: hex,
                  boxShadow: "inset 0 0 0 2px rgb(0 0 0 / 0.1)",
                  opacity: reveal(10 + i),
                  transform: `scale(${0.8 + 0.2 * reveal(10 + i)})`,
                }}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: saveBtn.x,
            top: saveBtn.y,
            display: "flex",
            alignItems: "center",
            opacity: reveal(14),
          }}
        >
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              gap: 14,
              justifyContent: "center",
              width: saveBtn.w,
              height: saveBtn.h,
              borderRadius: 20,
              background: COLOR.press,
              color: COLOR.paper,
              fontSize: 28,
              fontWeight: 500,
              transform: `scale(${1 - interpolate(frame, [OPEN - 2, OPEN, OPEN + 4], [0, 0.04, 0], clamp)})`,
            }}
          >
            <Icon
              d={BOOKMARK}
              size={30}
              fill={saved ? "currentColor" : "none"}
            />
            {saved ? "Saved" : "Save to board"}
          </div>
          <div
            style={{
              position: "absolute",
              zIndex: 1,
              left: saveBtn.w - 40,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 10,
              height: 66,
              padding: "0 26px 0 62px",
              borderRadius: "0 20px 20px 0",
              background: COLOR.press,
              color: COLOR.paper,
              fontSize: 24,
              opacity: tab,
              transform: `translateX(${(1 - tab) * -56}px)`,
            }}
          >
            <Icon d={CHECK} size={26} width={2.5} />
            Saved to
            <span
              style={{
                fontWeight: 500,
                textDecoration: "underline",
                textUnderlineOffset: 5,
              }}
            >
              {BOARDS[0]}
            </span>
          </div>
          <div
            style={{
              marginLeft: 16 + tab * (TAB_W - 24),
              display: "flex",
              alignItems: "center",
              gap: 14,
              height: likeBtn.h,
              padding: "0 32px",
              borderRadius: 20,
              border: `2px solid ${BORDER}`,
              background: "#FFFFFF",
              fontSize: 28,
            }}
          >
            <div style={{ transform: `scale(${pulse})`, display: "flex" }}>
              <Icon
                d={HEART}
                size={30}
                color={liked ? LIKE_RED : MUTED}
                fill={liked ? LIKE_RED : "none"}
              />
            </div>
            {liked ? "Liked" : "Like"}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: INFO_X,
            top: popTop,
            width: 480,
            padding: 16,
            borderRadius: 32,
            background: "rgb(255 255 255 / 0.94)",
            border: `2px solid ${BORDER}`,
            boxShadow:
              "0 40px 80px -24px rgb(0 0 0 / 0.3), 0 0 0 2px rgb(0 0 0 / 0.04)",
            opacity: pop,
            transform: `translateY(${(1 - pop) * -8}px) scale(${0.96 + 0.04 * pop})`,
            transformOrigin: "top left",
            fontSize: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 8px 14px 12px",
              borderBottom: `2px solid ${BORDER}`,
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            Save to board
            <Icon size={26} color={MUTED} d="M18 6 6 18M6 6l12 12" />
          </div>
          {BOARDS.map((board, i) => {
            const hover = i === 0 && frame >= PICK_BOARD - 6;
            return (
              <div
                key={board}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginTop: 8,
                  padding: "10px 12px",
                  borderRadius: 16,
                  background: hover ? "rgb(18 18 18 / 0.06)" : "transparent",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 56,
                    borderRadius: 6,
                    overflow: "hidden",
                    background: VIEW_COVERS[i + 1].color,
                  }}
                >
                  <Img
                    src={VIEW_COVERS[i + 1].src}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                {board}
              </div>
            );
          })}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 8,
              padding: "14px 12px",
              color: MUTED,
            }}
          >
            <div
              style={{ width: 40, display: "flex", justifyContent: "center" }}
            >
              <Icon size={28} color={MUTED} d="M5 12h14M12 5v14" />
            </div>
            New board
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: heroX,
            top: heroY,
            width: heroW,
            height: heroH,
            borderRadius: interpolate(fly, [0, 1], [4, 28]),
            overflow: "hidden",
            background: VIEW_COVERS[PICK].color,
            boxShadow:
              "0 30px 60px -30px rgb(0 0 0 / 0.5), 0 0 0 2px rgb(0 0 0 / 0.05)",
          }}
        >
          <Img
            src={VIEW_COVERS[PICK].src}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {thumbFly > 0 && thumbFly < 1 ? (
          <div
            style={{
              position: "absolute",
              left: interpolate(thumbFly, [0, 1], [HERO.x + 60, 1760]),
              top: interpolate(thumbFly, [0, 1], [HERO.y + 90, 40]),
              width: interpolate(thumbFly, [0, 1], [340, 40]),
              height: interpolate(thumbFly, [0, 1], [510, 60]),
              borderRadius: 12,
              overflow: "hidden",
              opacity: interpolate(
                thumbFly,
                [0, 0.15, 0.85, 1],
                [0, 0.95, 0.95, 0],
              ),
              transform: `rotate(${thumbFly * 14}deg)`,
              boxShadow: "0 24px 48px -16px rgb(0 0 0 / 0.45)",
            }}
          >
            <Img
              src={VIEW_COVERS[PICK].src}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : null}

        {frame >= 30 ? <Cursor x={cursorX} y={cursorY} press={press} /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
