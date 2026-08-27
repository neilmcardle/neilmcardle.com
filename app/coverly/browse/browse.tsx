"use client";

import type {
  CoverCard as CoverCardType,
  CoverFilters,
} from "@/lib/coverly/queries";
import { useEffect, useState } from "react";
import { rememberBrowse } from "@/lib/coverly/last-browse";
import { useLocalPref } from "@/lib/coverly/use-local-pref";
import { useMediaQuery } from "@/lib/coverly/use-media-query";
import { BrowseFilters } from "./browse-filters";
import { useRouter } from "next/navigation";
import { ColourMap } from "./colour-map";
import { CoverGrid } from "./cover-grid";
import { fetchMapPoints, type MapPoint } from "./actions";
import { ViewControls, type LayoutMode } from "./view-controls";

const MODE_KEY = "coverly:view-mode";
const SIZE_KEY = "coverly:view-size";

const parseMode = (raw: string): LayoutMode | null =>
  raw === "grid" || raw === "bookshelf" || raw === "map" ? raw : null;

const parseSize = (raw: string): number | null => {
  const value = Number(raw);
  return value >= 120 && value <= 280 ? value : null;
};

export function Browse({
  initialCovers,
  total,
  filters,
}: {
  initialCovers: CoverCardType[];
  total: number;
  filters: CoverFilters;
}) {
  const [mode, setMode] = useLocalPref<LayoutMode>(MODE_KEY, "grid", parseMode);
  const [size, setSize] = useLocalPref<number>(SIZE_KEY, 170, parseSize);
  const [zoom, setZoom] = useState(1);
  const [points, setPoints] = useState<MapPoint[] | null>(null);
  const isNarrow = useMediaQuery("(max-width: 639px)");
  const router = useRouter();

  useEffect(() => {
    rememberBrowse(window.location.pathname + window.location.search);
  }, [filters]);

  const effectiveMode: LayoutMode = isNarrow ? "grid" : mode;

  useEffect(() => {
    if (effectiveMode !== "map") return;
    let live = true;
    fetchMapPoints(filters).then((rows) => {
      if (live) setPoints(rows);
    });
    return () => {
      live = false;
    };
  }, [effectiveMode, filters]);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <BrowseFilters total={total} />
        </div>
        <ViewControls
          mode={mode}
          size={size}
          zoom={zoom}
          onMode={setMode}
          onSize={setSize}
          onZoom={setZoom}
          showModes={!isNarrow}
        />
      </div>
      {effectiveMode === "map" ? (
        points === null ? (
          <div className="h-[min(72dvh,720px)] animate-pulse rounded-[1rem] border bg-muted/40" />
        ) : (
          <ColourMap
            points={points}
            zoom={zoom}
            onZoom={setZoom}
            onOpen={(id) => router.push(`/coverly/covers/${id}`)}
          />
        )
      ) : (
        <CoverGrid
          key={JSON.stringify(filters)}
          initialCovers={initialCovers}
          total={total}
          filters={filters}
          mode={effectiveMode}
          size={size}
        />
      )}
    </>
  );
}
