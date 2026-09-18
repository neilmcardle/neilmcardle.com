"use client";

import { useState } from "react";
import type { FocusSettings, AmbientSound } from "../hooks/useFocusMode";
import styles from "../styles/studio.module.css";

interface Props {
  settings: FocusSettings;
  onChangeSetting: <K extends keyof FocusSettings>(
    key: K,
    value: FocusSettings[K],
  ) => void;
  onExit: () => void;
}

const CLOUD =
  "M6 11h8.5a3 3 0 0 0 .4-5.97A4.5 4.5 0 0 0 6.2 6.1 2.5 2.5 0 0 0 6 11z";

const SOUNDS: {
  value: Exclude<AmbientSound, "none" | "custom">;
  label: string;
  path: string;
}[] = [
  {
    value: "rain-light",
    label: "Light rain",
    path: `${CLOUD}M10.5 14l-1 3`,
  },
  {
    value: "rain-medium",
    label: "Rain",
    path: `${CLOUD}M7 14l-1 3M10.5 14l-1 3M14 14l-1 3`,
  },
  {
    value: "waves",
    label: "Waves",
    path: "M2 8c2-2 4-2 6 0s4 2 6 0 3-1.5 4-1M2 13c2-2 4-2 6 0s4 2 6 0 3-1.5 4-1",
  },
  {
    value: "fire",
    label: "Fire",
    path: "M10 18c3 0 5-2 5-5 0-3-2-4-3-7-1 2-2 3-3 3 0-2-1-4-2-6-1 3-4 5-4 10 0 3 3 5 7 5z",
  },
  {
    value: "train",
    label: "Train",
    path: "M5 3h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM3 9h14M7 15l-2 3M13 15l2 3M6.5 12h.01M13.5 12h.01",
  },
  {
    value: "pink-noise",
    label: "Pink noise",
    path: "M2 10h2l2-4 2 8 2-10 2 12 2-8 2 4h2",
  },
];

function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className={styles.focusRow}>
      <span className={styles.focusRowText}>
        <span className={styles.focusRowLabel}>{label}</span>
        {hint && <span className={styles.focusRowHint}>{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`${styles.switch} ${checked ? styles.switchOn : ""}`}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}

export function FocusModePanel({ settings, onChangeSetting, onExit }: Props) {
  const [open, setOpen] = useState(false);
  const [lastSound, setLastSound] = useState<AmbientSound>(
    settings.ambientSound !== "none" ? settings.ambientSound : "rain-light",
  );
  const soundOn = settings.ambientSound !== "none";

  const pickSound = (value: AmbientSound) => {
    setLastSound(value);
    onChangeSetting("ambientSound", value);
  };

  return (
    <div className={styles.focusDock}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        className={`${styles.focusTrigger} ${open ? styles.focusTriggerOpen : ""}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="7" strokeOpacity={0.5} />
        </svg>
        {open ? "Done" : "Focus"}
      </button>

      {open && (
        <div
          className={styles.focusPanel}
          role="dialog"
          aria-label="Focus settings"
        >
          <p className={styles.micro}>Screen</p>
          <Switch
            label="Full screen"
            hint="Hide the browser around the page"
            checked={settings.fullScreen}
            onChange={(v) => onChangeSetting("fullScreen", v)}
          />
          <Switch
            label="Minimal interface"
            hint="Hide the menus and toolbar"
            checked={settings.hideChrome}
            onChange={(v) => onChangeSetting("hideChrome", v)}
          />
          <p className={`${styles.micro} ${styles.focusSection}`}>Writing</p>
          <Switch
            label="Typewriter mode"
            hint="Keeps the line you're writing centred"
            checked={settings.typewriterMode}
            onChange={(v) => onChangeSetting("typewriterMode", v)}
          />
          <Switch
            label="Paragraph focus"
            hint="Dims everything but the current paragraph"
            checked={settings.paragraphFocus}
            onChange={(v) => onChangeSetting("paragraphFocus", v)}
          />

          <p className={`${styles.micro} ${styles.focusSection}`}>Sound</p>
          <div
            className={styles.tiles}
            role="radiogroup"
            aria-label="Ambient sound"
          >
            {SOUNDS.map((s) => {
              const active = soundOn && settings.ambientSound === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`${styles.tile} ${active ? styles.tileActive : ""}`}
                  onClick={() => pickSound(s.value)}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={s.path} />
                  </svg>
                  {s.label}
                </button>
              );
            })}
          </div>
          <Switch
            label={soundOn ? "Sound on" : "Sound off"}
            checked={soundOn}
            onChange={(v) =>
              v ? pickSound(lastSound) : onChangeSetting("ambientSound", "none")
            }
          />
          <div className={styles.volumeRow} aria-disabled={!soundOn}>
            <span className={styles.focusRowLabel}>Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={settings.ambientVolume}
              disabled={!soundOn}
              aria-label="Volume"
              className={styles.range}
              style={
                {
                  "--fill": `${Math.round(settings.ambientVolume * 100)}%`,
                } as React.CSSProperties
              }
              onChange={(e) =>
                onChangeSetting("ambientVolume", parseFloat(e.target.value))
              }
            />
            <span className={styles.volumeValue}>
              {Math.round(settings.ambientVolume * 100)}%
            </span>
          </div>

          <button type="button" onClick={onExit} className={styles.focusExit}>
            Exit focus mode
            <kbd>Esc</kbd>
          </button>
        </div>
      )}
    </div>
  );
}
