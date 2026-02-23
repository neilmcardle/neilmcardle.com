"use client";
import { useState } from "react";
import type { FocusSettings, ColumnWidth, AmbientSound } from "../hooks/useFocusMode";

interface Props {
  settings: FocusSettings;
  onChangeSetting: <K extends keyof FocusSettings>(key: K, value: FocusSettings[K]) => void;
  onExit: () => void;
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-white/10 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-white/90 leading-tight">{label}</p>
        {description && (
          <p className="text-xs text-white/45 mt-0.5 leading-tight">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? "bg-white/80" : "bg-white/15"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full transition-transform duration-200 ${
            checked ? "translate-x-4 bg-gray-900" : "translate-x-1 bg-white/50"
          }`}
        />
      </button>
    </div>
  );
}

const COL_OPTIONS: { value: ColumnWidth; label: string }[] = [
  { value: "narrow", label: "Narrow" },
  { value: "normal", label: "Normal" },
  { value: "full", label: "Full" },
];

const SOUND_OPTIONS: { value: AmbientSound; label: string; icon: string }[] = [
  { value: "none", label: "Off", icon: "○" },
  { value: "pink-noise", label: "Pink noise", icon: "∿" },
  { value: "rain", label: "Rain", icon: "☁" },
  { value: "custom", label: "Custom", icon: "♪" },
];

// ── Floating panel (shown when focus mode is active) ─────────────────────────
// Positioned top-right so it's easy to find after entering focus mode.
export function FocusModePanel({ settings, onChangeSetting, onExit }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-[90] flex flex-col items-end gap-2 select-none">
      {/* Settings panel */}
      {open && (
        <div className="w-72 rounded-2xl bg-[#161616] backdrop-blur-xl border border-white/20 shadow-2xl p-5 text-sm animate-in fade-in slide-in-from-top-2 duration-150 mt-12">
          {/* Toggles */}
          <p className="text-[10px] font-semibold text-white/55 uppercase tracking-widest mb-3">
            View
          </p>
          <Toggle
            label="Minimal interface"
            description="Hide sidebar & status bar"
            checked={settings.hideChrome}
            onChange={(v) => onChangeSetting("hideChrome", v)}
          />
          <Toggle
            label="Hide formatting toolbar"
            description="Off by default — use keyboard shortcuts"
            checked={settings.hideToolbar}
            onChange={(v) => onChangeSetting("hideToolbar", v)}
          />
          <Toggle
            label="Full screen"
            checked={settings.fullScreen}
            onChange={(v) => onChangeSetting("fullScreen", v)}
          />

          {/* Column width */}
          <div className="py-2.5 border-b border-white/10">
            <p className="text-sm text-white/90 mb-2">Column width</p>
            <div className="flex rounded-lg overflow-hidden border border-white/20">
              {COL_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onChangeSetting("columnWidth", value)}
                  className={`flex-1 py-1.5 text-xs transition-colors ${
                    settings.columnWidth === value
                      ? "bg-white text-gray-900 font-medium"
                      : "text-white/60 hover:text-white/90 hover:bg-white/8"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] font-semibold text-white/55 uppercase tracking-widest mt-3 mb-3">
            Writing
          </p>
          <Toggle
            label="Typewriter mode"
            description="Cursor stays centred vertically"
            checked={settings.typewriterMode}
            onChange={(v) => onChangeSetting("typewriterMode", v)}
          />
          <Toggle
            label="Paragraph focus"
            description="Dims all but the active paragraph"
            checked={settings.paragraphFocus}
            onChange={(v) => onChangeSetting("paragraphFocus", v)}
          />

          {/* Ambient sound */}
          <p className="text-[10px] font-semibold text-white/55 uppercase tracking-widest mt-3 mb-3">
            Ambient sound
          </p>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {SOUND_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => onChangeSetting("ambientSound", value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                  settings.ambientSound === value
                    ? "bg-white text-gray-900 font-medium"
                    : "bg-white/8 text-white/65 hover:bg-white/12 hover:text-white/90"
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                {label}
              </button>
            ))}
          </div>
          {settings.ambientSound !== "none" && (
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-xs w-6">Vol</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={settings.ambientVolume}
                onChange={(e) =>
                  onChangeSetting("ambientVolume", parseFloat(e.target.value))
                }
                className="flex-1 h-1 accent-white cursor-pointer"
              />
              <span className="text-white/60 text-xs w-7 text-right">
                {Math.round(settings.ambientVolume * 100)}%
              </span>
            </div>
          )}

          {/* Exit */}
          <div className="border-t border-white/15 mt-4 pt-4">
            <button
              onClick={onExit}
              className="w-full py-2 rounded-lg border border-white/20 text-xs text-white/60 hover:text-white/90 hover:border-white/35 transition-colors"
            >
              Exit focus mode
              <span className="opacity-50 ml-2">Esc</span>
            </button>
          </div>
        </div>
      )}

      {/* The always-visible focus pill — top right */}
      <button
        onClick={() => setOpen((p) => !p)}
        title={open ? "Close settings" : "Focus settings"}
        className={`flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium transition-all duration-300 shadow-lg backdrop-blur-md border ${
          open
            ? "bg-white text-gray-900 border-transparent opacity-100"
            : "bg-[#111]/70 border-white/10 text-white/50 opacity-60 hover:opacity-100 hover:text-white/80"
        }`}
      >
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="7" strokeOpacity={0.5} />
        </svg>
        {open ? "Done" : "Focus"}
      </button>
    </div>
  );
}

// ── Entry button for the status bar (when NOT in focus mode) ──────────────────
export function FocusModeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Enter focus mode  ⌘⇧F"
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors group"
    >
      <svg
        className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="7" strokeOpacity={0.5} />
      </svg>
      <span className="text-xs text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
        Focus
      </span>
    </button>
  );
}
