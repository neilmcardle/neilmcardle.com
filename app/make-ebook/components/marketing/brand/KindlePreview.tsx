"use client";

import { useState } from "react";
import styles from "./brand.module.css";

const MANUSCRIPT = {
  fontFamily: 'var(--font-baskerville), "Libre Baskerville", Georgia, serif',
} as const;

const DEVICES = [
  { id: "kindle", label: "Kindle", className: "" },
  { id: "ipad", label: "iPad", className: styles.deviceIpad },
  { id: "phone", label: "Phone", className: styles.devicePhone },
] as const;

const THEMES = [
  {
    id: "white",
    label: "White page",
    swatch: "#ffffff",
    page: "#f2efe7",
    ink: "#2a2a28",
    muted: "#77746b",
  },
  {
    id: "sepia",
    label: "Sepia page",
    swatch: "#e9dfc7",
    page: "#ead9bd",
    ink: "#4a3a25",
    muted: "#8a7656",
  },
  {
    id: "dark",
    label: "Dark page",
    swatch: "#1b1b18",
    page: "#1e1e1c",
    ink: "#d8d4c9",
    muted: "#8e8b82",
  },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];
type ThemeId = (typeof THEMES)[number]["id"];

export function KindlePreview() {
  const [device, setDevice] = useState<DeviceId>("kindle");
  const [themeId, setThemeId] = useState<ThemeId>("white");
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const frame = DEVICES.find((d) => d.id === device) ?? DEVICES[0];
  const body = [
    "Rain had been falling on the city since before she woke, the soft kind that does not so much fall as arrive, settling on the windows and the wet slate roofs until every surface carried a little of the sky.",
    "Elena walked the length of the pier with her collar up and the manuscript held flat against her chest, its pages still warm from the bag. The water below was the colour of pewter, and the old iron columns went down into it without a sound.",
    "At the end of the pier she stopped and let the rain find her face. Somewhere behind her a gull cried once and gave up. She had come here to decide something, and the city, patient as ever, was waiting for her to say it aloud.",
    "The manuscript had taken her four winters. She knew its weight the way she knew the weight of her own coat, and she knew, too, which pages were still damp with doubt. Chapter forty had been the hardest. It was the one where the city stopped being a backdrop and started, quietly, to answer back.",
    "A ferry crossed the mouth of the harbour with its lights already on, though it was not yet three. She watched it go and thought about the version of herself who had stepped off one just like it, years ago, with nothing but a notebook and the wrong shoes for the weather.",
  ];

  return (
    <div className={styles.previewStage}>
      <div
        className={styles.deviceTabs}
        role="tablist"
        aria-label="Preview device"
      >
        {DEVICES.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={device === d.id}
            className={`${styles.deviceTab} ${device === d.id ? styles.deviceTabActive : ""}`}
            onClick={() => setDevice(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div
        className={[styles.kindle, frame.className].filter(Boolean).join(" ")}
        style={
          {
            "--page": theme.page,
            "--page-ink": theme.ink,
            "--page-muted": theme.muted,
          } as React.CSSProperties
        }
      >
        <div className={styles.kindleScreen}>
          <p className={styles.kindleChapter}>Chapter Forty</p>
          <p className={styles.kindleTitle}>The Rainy City</p>
          <div className={styles.kindleBody} style={MANUSCRIPT}>
            {body.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
          <div className={styles.kindleFoot}>
            <span>Loc 1</span>
            <span>1%</span>
          </div>
        </div>
      </div>
      <div className={styles.themeDots} role="group" aria-label="Page colour">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={themeId === t.id}
            aria-label={t.label}
            className={`${styles.themeDot} ${themeId === t.id ? styles.themeDotActive : ""}`}
            style={{ background: t.swatch }}
            onClick={() => setThemeId(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
