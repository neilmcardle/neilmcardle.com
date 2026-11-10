"use client";

import type {
  CoverCard as CoverCardType,
  CoverFilters,
} from "@/lib/coverly/queries";
import { useEffect, useRef, useState } from "react";
import { rememberBrowse } from "@/lib/coverly/last-browse";
import { useLocalPref } from "@/lib/coverly/use-local-pref";
import { useMediaQuery } from "@/lib/coverly/use-media-query";
import { BrowseFilters } from "./browse-filters";
import { ColourMap } from "./colour-map";
import { CoverGrid, DetailPanel } from "./cover-grid";
import {
  fetchCoverDetail,
  fetchMapPoints,
  fetchSimilarCovers,
} from "./actions";
import { useRemote } from "./use-remote";
import { ViewControls, type LayoutMode } from "./view-controls";

const MODE_KEY = "coverly:view-mode";
const SIZE_KEY = "coverly:view-size";
const COLS_KEY = "coverly:view-cols";

const parseMode = (raw: string): LayoutMode | null =>
  raw === "grid" || raw === "bookshelf" || raw === "map" ? raw : null;

const parseCols = (raw: string): number | null =>
  raw === "1" || raw === "2" ? Number(raw) : null;

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
  const [columns, setColumns] = useLocalPref<number>(COLS_KEY, 2, parseCols);
  const [zoom, setZoom] = useState(1);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const pickedDetail = useRemote(pickedId, fetchCoverDetail);
  const pickedSimilar = useRemote(pickedId, fetchSimilarCovers);
  const isNarrow = useMediaQuery("(max-width: 639px)");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rememberBrowse(window.location.pathname + window.location.search);
  }, [filters]);

  const effectiveMode: LayoutMode = isNarrow ? "grid" : mode;
  const picked = pickedDetail.data;
  const pickedRows = pickedSimilar.data;
  const mapKey = effectiveMode === "map" ? JSON.stringify(filters) : null;
  const mapPoints = useRemote(mapKey, () => fetchMapPoints(filters));
  const points = mapPoints.data;

  useEffect(() => {
    if (!picked) return;
    const el = panelRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      const headerH =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--coverly-header-h",
          ),
        ) || 0;
      const body = document.body;
      const bodyScrolls =
        getComputedStyle(body).overflowY !== "visible" &&
        body.scrollHeight > body.clientHeight + 2;
      const scroller = (
        bodyScrolls
          ? body
          : document.scrollingElement || document.documentElement
      ) as HTMLElement;
      const delta = el.getBoundingClientRect().top - headerH - 12;
      if (Math.abs(delta) < 8) return;
      scroller.scrollTo({
        top: Math.max(0, scroller.scrollTop + delta),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [picked]);

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
          columns={columns}
          narrow={isNarrow}
          onMode={setMode}
          onSize={setSize}
          onZoom={setZoom}
          onColumns={setColumns}
          showModes={!isNarrow}
        />
      </div>
      {effectiveMode === "map" ? (
        points === null ? (
          mapPoints.failed ? (
            <p
              role="alert"
              className="flex h-[min(72dvh,720px)] items-center justify-center rounded-[1rem] border text-sm text-muted-foreground"
            >
              <span>
                The colour map didn’t load.{" "}
                <button
                  type="button"
                  onClick={mapPoints.retry}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Try again
                </button>
              </span>
            </p>
          ) : (
            <div className="h-[min(72dvh,720px)] animate-pulse rounded-[1rem] border bg-muted/40" />
          )
        ) : (
          <>
            <ColourMap
              points={points}
              zoom={zoom}
              onZoom={setZoom}
              onOpen={setPickedId}
              selectedId={pickedId}
            />
            {pickedId && !picked && pickedDetail.failed && (
              <p role="alert" className="mt-4 text-sm text-muted-foreground">
                That cover didn’t load.{" "}
                <button
                  type="button"
                  onClick={pickedDetail.retry}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Try again
                </button>
              </p>
            )}
            {pickedId && picked && (
              <div ref={panelRef} className="mt-4 scroll-mt-32">
                <DetailPanel
                  cover={{
                    id: picked.id,
                    isbn13: picked.isbn13,
                    title: picked.title,
                    author: picked.author,
                    imprint: picked.imprint,
                    year: picked.year,
                    image_url: picked.image_url,
                    palette: picked.palette,
                  }}
                  detail={picked}
                  similar={pickedRows}
                  similarFailed={pickedSimilar.failed}
                  onRetrySimilar={pickedSimilar.retry}
                  onClose={() => setPickedId(null)}
                  onSimilar={setPickedId}
                  onLayout={() => {}}
                />
              </div>
            )}
          </>
        )
      ) : (
        <CoverGrid
          key={JSON.stringify(filters)}
          initialCovers={initialCovers}
          total={total}
          filters={filters}
          mode={effectiveMode}
          size={size}
          columns={isNarrow ? columns : null}
        />
      )}
    </>
  );
}
