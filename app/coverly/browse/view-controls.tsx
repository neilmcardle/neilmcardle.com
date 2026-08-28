"use client";

import {
  ChartScatter,
  Columns2,
  LayoutGrid,
  Rows2,
  Square,
} from "lucide-react";
import { LikesButton } from "../likes-button";
import { ZOOM_MAX, ZOOM_MIN } from "./colour-map";

const SPAN = Math.log(ZOOM_MAX / ZOOM_MIN);
const zoomToPos = (z: number) =>
  Math.round((Math.log(z / ZOOM_MIN) / SPAN) * 100);
const posToZoom = (p: number) => ZOOM_MIN * Math.exp((p / 100) * SPAN);

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
  columns,
  narrow = false,
  onMode,
  onSize,
  onZoom,
  onColumns,
  showModes = true,
}: {
  mode: LayoutMode;
  size: number;
  zoom: number;
  columns: number;
  narrow?: boolean;
  onMode: (m: LayoutMode) => void;
  onSize: (n: number) => void;
  onZoom: (n: number) => void;
  onColumns: (n: number) => void;
  showModes?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      {!narrow && (
        <div className="flex h-[34px] items-center rounded-[0.625rem] border bg-card px-3">
          {mode === "map" ? (
            <input
              type="range"
              min={0}
              max={100}
              value={zoomToPos(zoom)}
              onChange={(e) => onZoom(posToZoom(Number(e.target.value)))}
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
      )}

      <LikesButton inToolbar />

      {narrow && (
        <div className="inline-flex h-[34px] items-center rounded-[0.625rem] border bg-card p-0.5">
          {[1, 2].map((n) => {
            const active = columns === n;
            const Icon = n === 1 ? Square : Columns2;
            return (
              <button
                key={n}
                onClick={() => onColumns(n)}
                aria-pressed={active}
                aria-label={`${n === 1 ? "One" : "Two"} column${n === 1 ? "" : "s"}`}
                title={`${n === 1 ? "One" : "Two"} column${n === 1 ? "" : "s"}`}
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
