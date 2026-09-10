import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Neil McArdle, a product designer in London.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREAM = "#fbf9f3";
const MUTED = "#8a7f70";
const GLASS = "rgba(255, 255, 255, 0.06)";
const EDGE = "rgba(251, 249, 243, 0.14)";

const DOT_STEPS = [1, 9.25, 17.5, 25.75, 34, 42.25, 50.5, 58.75];
const DOT_EDGE = [DOT_STEPS[0], DOT_STEPS[DOT_STEPS.length - 1]];

const GRID = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="d" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="2.67" height="2.67" fill="#d9d9d9" fill-opacity="0.2"/></pattern><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.5"/><stop offset="0.78" stop-color="#fff" stop-opacity="0.14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="m"><rect width="1200" height="630" fill="url(#f)"/></mask></defs><rect width="1200" height="630" fill="url(#d)" mask="url(#m)"/></svg>`;

async function loadGoogleFont(family: string, weight: number) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(
    / /g,
    "+",
  )}:wght@${weight}`;
  const css = await (
    await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit" },
    })
  ).text();
  const match = css.match(/src: url\((.+?)\) format\('(truetype|opentype)'\)/);
  if (!match) throw new Error(`Could not load ${family} ${weight}`);
  return await (await fetch(match[1])).arrayBuffer();
}

function dataUrl(bytes: Buffer, type: string) {
  return `data:${type};base64,${bytes.toString("base64")}`;
}

export default async function OpenGraphImage() {
  const [interRegular, interMedium, glow, portrait] = await Promise.all([
    loadGoogleFont("Inter", 400),
    loadGoogleFont("Inter", 500),
    readFile(join(process.cwd(), "public", "og", "glow.jpg")),
    readFile(join(process.cwd(), "public", "hero", "portrait.png")),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#0a0a0a",
      }}
    >
      <img
        alt=""
        src={dataUrl(glow, "image/jpeg")}
        width={1200}
        height={630}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <img
        alt=""
        src={dataUrl(Buffer.from(GRID), "image/svg+xml")}
        width={1200}
        height={630}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px 136px",
        }}
      >
        <svg width="52" height="52" viewBox="0 0 63 63">
          <rect
            x="0.5"
            y="0.5"
            width="62"
            height="62"
            rx="10.5"
            fill={GLASS}
            stroke={EDGE}
          />
          {DOT_STEPS.flatMap((y) =>
            DOT_STEPS.map((x) =>
              DOT_EDGE.includes(x) && DOT_EDGE.includes(y) ? null : (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width="3.25"
                  height="3.25"
                  fill="rgba(251, 249, 243, 0.06)"
                />
              ),
            ),
          )}
          <path d="M45 45L32 31.2985V18H45V45Z" fill={CREAM} />
          <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" fill={CREAM} />
        </svg>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div
              style={{
                display: "flex",
                width: 136,
                height: 136,
                padding: 7,
                borderRadius: 22,
                border: `1px solid ${EDGE}`,
                backgroundColor: GLASS,
              }}
            >
              <img
                alt="Neil McArdle"
                src={dataUrl(portrait, "image/png")}
                width={120}
                height={120}
                style={{
                  borderRadius: 14,
                  backgroundColor: "#0a0a0a",
                  transform: "scaleX(-1)",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontFamily: "InterMedium",
                  fontSize: 52,
                  letterSpacing: -1,
                  lineHeight: 1.1,
                  color: CREAM,
                }}
              >
                Neil McArdle
              </div>
              <div
                style={{
                  fontFamily: "Inter",
                  fontSize: 24,
                  marginTop: 6,
                  color: MUTED,
                }}
              >
                neilmcardle.com
              </div>
            </div>
          </div>

          <div
            style={{
              fontFamily: "Inter",
              fontSize: 54,
              letterSpacing: -1.1,
              lineHeight: 1.2,
              marginTop: 40,
              maxWidth: 600,
              color: "rgba(251, 249, 243, 0.92)",
            }}
          >
            I’m Neil, a product designer in London.
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Inter", data: interRegular, weight: 400, style: "normal" },
        {
          name: "InterMedium",
          data: interMedium,
          weight: 500,
          style: "normal",
        },
      ],
    },
  );
}
