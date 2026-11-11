"use client";

import React from "react";
import { useBook, useBookActions } from "../providers/BookProvider";
import { normalisePreset, PRESET_IDS, PRESETS } from "../export/styles";
import styles from "../styles/studio.module.css";

export default function TypographyPicker({
  withHint = false,
}: {
  withHint?: boolean;
}) {
  const preset = normalisePreset(useBook((s) => s.typography));
  const { setTypography } = useBookActions();
  return (
    <div className={styles.presetPick}>
      <label>
        <span className={styles.presetLabel}>Book style</span>
        <select
          className={styles.presetSelect}
          value={preset}
          onChange={(e) => setTypography(e.target.value)}
        >
          {PRESET_IDS.map((id) => (
            <option key={id} value={id}>
              {PRESETS[id].name}
            </option>
          ))}
        </select>
      </label>
      {withHint && (
        <span className={styles.presetHint}>{PRESETS[preset].description}</span>
      )}
    </div>
  );
}
