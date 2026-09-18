"use client";

import React, { useState } from "react";
import { GENRES } from "../utils/constants";

const OTHER = "__other";
const ALL = Object.values(GENRES).flat();

interface GenrePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export default function GenrePicker({
  value,
  onChange,
  id,
  className = "",
  disabled = false,
}: GenrePickerProps) {
  const listed = ALL.includes(value);
  const [custom, setCustom] = useState(!!value && !listed);

  return (
    <div className="flex flex-col gap-2">
      <select
        id={id}
        className={className}
        disabled={disabled}
        value={custom ? OTHER : listed ? value : ""}
        onChange={(e) => {
          if (e.target.value === OTHER) {
            setCustom(true);
            onChange("");
          } else {
            setCustom(false);
            onChange(e.target.value);
          }
        }}
      >
        <option value="" disabled>
          Choose a genre
        </option>
        {Object.entries(GENRES).map(([group, genres]) => (
          <optgroup key={group} label={group}>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={OTHER}>Something else…</option>
      </select>
      {custom && (
        <input
          className={className}
          disabled={disabled}
          value={value}
          autoFocus
          placeholder="Your genre"
          aria-label="Your genre"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
