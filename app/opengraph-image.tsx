import { ImageResponse } from "next/og";
import {
  COVERLY_MARK,
  DOODLEWIRE_BOTTOM,
  DOODLEWIRE_TOP,
  MAKEEBOOK_MARK,
  MAKEEBOOK_TRANSFORM,
} from "@/components/home/ProductBadge";
import { SPARK_MARK_PATH } from "@/components/spark/SparkMark";
import { SHARE_ALT } from "./shared-metadata";

export const runtime = "nodejs";
export const alt = SHARE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BONE = "#ebe8e4";
const CARD = "#fdfcfb";
const INK = "#000000";
const MUTED = "#736d64";
const LINE = "#e4e0da";

const PRODUCTS = [
  {
    name: "makeebook",
    line: "A peaceful place for authors to write their most thoughtful work.",
    view: "8 22 48 18",
    width: 34,
    height: 13,
    mark: <path d={MAKEEBOOK_MARK} transform={MAKEEBOOK_TRANSFORM} />,
  },
  {
    name: "Coverly",
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
  {
    name: "Spark",
    line: "A course for designers heading in the direction of design-engineer.",
    view: "20 13 23 37",
    width: 14,
    height: 22,
    mark: <path d={SPARK_MARK_PATH} />,
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
    loadGoogleFont("Geist", 300),
    loadGoogleFont("Geist", 400),
    loadGoogleFont("Geist", 500),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: BONE,
        fontFamily: "Geist",
        color: INK,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 580,
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
            fontFamily: "GeistMedium",
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
            fontFamily: "GeistLight",
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
          width: 556,
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
            fontFamily: "Geist",
            fontSize: 34,
            letterSpacing: -0.8,
          }}
        >
          Things I’ve said and done
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontFamily: "GeistMedium",
            fontSize: 24,
            letterSpacing: -0.4,
          }}
        >
          Products
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", marginTop: 10 }}
        >
          {PRODUCTS.map((product) => (
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
                    width: 34,
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
                <span style={{ fontFamily: "GeistMedium", fontSize: 22 }}>
                  {product.name}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 6,
                  marginLeft: 46,
                  fontFamily: "Geist",
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
        { name: "GeistLight", data: light, weight: 300, style: "normal" },
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "GeistMedium", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
