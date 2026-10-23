import { ImageResponse } from "next/og";
import {
  COVERLY_MARK,
  DOODLEWIRE_BOTTOM,
  DOODLEWIRE_TOP,
  MAKEEBOOK_MARK,
  MAKEEBOOK_TRANSFORM,
} from "@/components/home/ProductBadge";
import { AVIS_PATHS } from "@/app/_home/AvisLogo";
import { SHARE_ALT } from "./shared-metadata";

export const runtime = "nodejs";
export const alt = SHARE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BONE = "#ffffff";
const CARD = "#ffffff";
const INK = "#111111";
const MUTED = "#6b675f";
const LINE = "#e3e0da";

const WORK = [
  {
    name: "3-Step Checkout",
    line: "Taking car rental booking from five steps to three.",
    view: "200 18 75.6328 32",
    width: 48,
    height: 20,
    mark: (
      <g>
        {AVIS_PATHS.map((d) => (
          <path key={d.slice(0, 16)} d={d} />
        ))}
      </g>
    ),
  },
  {
    name: "makeebook",
    line: "A peaceful place for authors to write their most thoughtful work.",
    view: "8 22 48 18",
    width: 34,
    height: 13,
    mark: <path d={MAKEEBOOK_MARK} transform={MAKEEBOOK_TRANSFORM} />,
  },
  {
    name: "coverly",
    line: "Be inspired to design your next book cover.",
    view: "15 12 34 34",
    width: 22,
    height: 22,
    mark: <path d={COVERLY_MARK} />,
  },
  {
    name: "DoodleWire",
    line: "Wireframe from your phone.",
    view: "15 14 34 31",
    width: 24,
    height: 22,
    mark: (
      <g>
        <path fillRule="evenodd" clipRule="evenodd" d={DOODLEWIRE_TOP} />
        <path d={DOODLEWIRE_BOTTOM} />
      </g>
    ),
  },
];

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

export default async function OpenGraphImage() {
  const [light, regular, medium] = await Promise.all([
    loadGoogleFont("Inter", 300),
    loadGoogleFont("Inter", 400),
    loadGoogleFont("Inter", 500),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: BONE,
        fontFamily: "Inter",
        color: INK,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 540,
          padding: "0 0 0 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 148,
            height: 148,
            borderRadius: 34,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            backgroundImage:
              "linear-gradient(145deg, #ffffff 0%, #f3f1ee 100%)",
            boxShadow:
              "0 2px 4px rgba(0, 0, 0, 0.06), 0 24px 48px rgba(0, 0, 0, 0.12)",
          }}
        >
          <svg width="68" height="68" viewBox="18 18 27 27">
            <path d="M45 45L32 31.2985V18H45V45Z" fill={INK} />
            <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" fill={INK} />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontFamily: "InterMedium",
            fontSize: 44,
            lineHeight: 1.1,
            letterSpacing: -1.2,
          }}
        >
          Neil McArdle
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 2,
            fontFamily: "InterLight",
            fontSize: 44,
            lineHeight: 1.1,
            letterSpacing: -1.2,
          }}
        >
          Product Designer
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 612,
          marginTop: 56,
          padding: "40px 40px 0",
          borderRadius: "28px 28px 0 0",
          backgroundColor: CARD,
          boxShadow:
            "0 1px 2px rgba(0, 0, 0, 0.04), 0 16px 32px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontSize: 34,
            letterSpacing: -0.8,
          }}
        >
          Work
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", marginTop: 24 }}
        >
          {WORK.map((product) => (
            <div
              key={product.name}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "16px 0",
                borderTop: `1px solid ${LINE}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 22,
                  }}
                >
                  <svg
                    width={product.width}
                    height={product.height}
                    viewBox={product.view}
                    fill={INK}
                  >
                    {product.mark}
                  </svg>
                </div>
                <span style={{ fontFamily: "InterMedium", fontSize: 22 }}>
                  {product.name}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 6,
                  marginLeft: 60,
                  fontFamily: "Inter",
                  fontSize: 18,
                  color: MUTED,
                }}
              >
                {product.line}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "InterLight", data: light, weight: 300, style: "normal" },
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "InterMedium", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
