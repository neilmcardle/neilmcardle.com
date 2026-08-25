"use client";

import type {
  CoverCard as CoverCardType,
  CoverFilters,
} from "@/lib/coverly/queries";
import { useLocalPref } from "@/lib/coverly/use-local-pref";
import { BrowseFilters } from "./browse-filters";
import { CoverGrid } from "./cover-grid";
import { ViewControls, type LayoutMode } from "./view-controls";

const MODE_KEY = "coverly:view-mode";
const SIZE_KEY = "coverly:view-size";

const parseMode = (raw: string): LayoutMode | null =>
  raw === "grid" || raw === "bookshelf" ? raw : null;

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

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <BrowseFilters total={total} />
        </div>
        <ViewControls
          mode={mode}
          size={size}
          onMode={setMode}
          onSize={setSize}
        />
      </div>
      <CoverGrid
        key={JSON.stringify(filters)}
        initialCovers={initialCovers}
        total={total}
        filters={filters}
        mode={mode}
        size={size}
      />
    </>
  );
}
