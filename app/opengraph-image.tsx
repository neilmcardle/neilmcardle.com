import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Neil McArdle. I make complex tools feel effortless.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(family: string, weight: number) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(
    / /g,
    "+"
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

// Path data from /public/neil-mcardle-logomark.svg (viewBox 0 0 241 241).
const LOGOMARK_PATH =
  "M.5,236.5V1.8l240,237.3V4.5c0-2.2-1.8-4-4-4h-112c-2.2,0-4,1.8-4,4v232c0,2.2-1.8,4-4,4H4.5c-2.2,0-4-1.8-4-4Z";

export default async function OpenGraphImage() {
  const [playfair, inter, interMedium, photoBytes] = await Promise.all([
    loadGoogleFont("Playfair Display", 400),
    loadGoogleFont("Inter", 300),
    loadGoogleFont("Inter", 500),
    readFile(join(process.cwd(), "public", "me.png")),
  ]);

  const photoDataUrl = `data:image/png;base64,${Buffer.from(photoBytes).toString(
    "base64"
  )}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="300"
            height="300"
            viewBox="0 0 241 241"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d={LOGOMARK_PATH} fill="rgba(255,255,255,0.22)" />
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 36,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div
              style={{
                display: "flex",
                width: 160,
                height: 160,
                borderRadius: 999,
                overflow: "hidden",
                flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.12)",
              }}
            >
              <img
                src={photoDataUrl}
                width={160}
                height={160}
                style={{ objectFit: "cover", width: 160, height: 160 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontFamily: "Playfair",
                  fontSize: 80,
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                  color: "#ffffff",
                  display: "flex",
                }}
              >
                Neil McArdle
              </div>
              <div
                style={{
                  fontFamily: "Inter",
                  fontSize: 28,
                  fontWeight: 300,
                  lineHeight: 1.3,
                  color: "rgba(255,255,255,0.70)",
                  display: "flex",
                  marginTop: 14,
                  maxWidth: 620,
                }}
              >
                I make complex tools feel effortless.
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "InterMedium",
              fontSize: 16,
              fontWeight: 500,
              color: "rgba(255,255,255,0.40)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 24,
                height: 1,
                backgroundColor: "rgba(255,255,255,0.25)",
              }}
            />
            neilmcardle.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Playfair", data: playfair, weight: 400, style: "normal" },
        { name: "Inter", data: inter, weight: 300, style: "normal" },
        { name: "InterMedium", data: interMedium, weight: 500, style: "normal" },
      ],
    }
  );
}
