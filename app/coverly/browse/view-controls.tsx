"use client";

import { ChartScatter, LayoutGrid, Rows2 } from "lucide-react";

export type LayoutMode = "grid" | "bookshelf" | "map";

const MODES: { key: LayoutMode; label: string; Icon: typeof LayoutGrid }[] = [
  { key: "grid", label: "Grid", Icon: LayoutGrid },
  { key: "bookshelf", label: "Bookshelf", Icon: Rows2 },
  { key: "map", label: "Colour map", Icon: ChartScatter },
];

export function ViewControls({
  mode,
  size,
  zoom,
  onMode,
  onSize,
  onZoom,
  showModes = true,
}: {
  mode: LayoutMode;
  size: number;
  zoom: number;
  onMode: (m: LayoutMode) => void;
  onSize: (n: number) => void;
  onZoom: (n: number) => void;
  showModes?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <div className="flex h-[34px] items-center rounded-[0.625rem] border bg-card px-3">
        {mode === "map" ? (
          <input
            type="range"
            min={60}
            max={900}
            value={Math.round(zoom * 100)}
            onChange={(e) => onZoom(Number(e.target.value) / 100)}
            aria-label="Map zoom"
            title="Map zoom"
            className="size-slider w-20 sm:w-24"
          />
        ) : (
          <input
            type="range"
            min={120}
            max={280}
            value={size}
            onChange={(e) => onSize(Number(e.target.value))}
            aria-label="Cover size"
            title="Cover size"
            className="size-slider w-20 sm:w-24"
          />
        )}
      </div>
      {showModes && (
        <div className="inline-flex h-[34px] items-center rounded-[0.625rem] border bg-card p-0.5">
          {MODES.map(({ key, label, Icon }) => {
            const active = key === mode;
            return (
              <button
                key={key}
                onClick={() => onMode(key)}
                aria-pressed={active}
                aria-label={`${label} view`}
                title={`${label} view`}
                className={`flex h-[28px] w-[28px] items-center justify-center rounded-[0.45rem] transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
