import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SHARE_ALT } from "./shared-metadata";

export const runtime = "nodejs";
export const alt = SHARE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
  const [light, regular, medium, field] = await Promise.all([
    loadGoogleFont("Inter", 300),
    loadGoogleFont("Inter", 400),
    loadGoogleFont("Inter", 500),
    readFile(join(process.cwd(), "public/og/n-particles-card.png")),
  ]);

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#0b0b0b",
        fontFamily: "Inter",
      }}
    >
      <img
        src={`data:image/png;base64,${field.toString("base64")}`}
        width={1200}
        height={630}
        alt=""
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 580,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "InterMedium",
            fontSize: 60,
            lineHeight: 1.1,
            letterSpacing: -1.8,
            color: "#f5f5f5",
          }}
        >
          Neil McArdle
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 4,
            fontFamily: "InterLight",
            fontSize: 60,
            lineHeight: 1.1,
            letterSpacing: -1.8,
            color: "#8f8f8f",
          }}
        >
          Product Designer
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 26,
            letterSpacing: -0.3,
            color: "#6f6f6f",
          }}
        >
          neilmcardle.com
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
