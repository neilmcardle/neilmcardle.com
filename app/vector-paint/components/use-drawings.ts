"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  pageSize,
  type Drawing,
  type Stroke,
} from "@/lib/vector-paint/drawing";
import type { VectorPaintOrientation } from "@/lib/vector-paint/products";

const LIBRARY_KEY = "vp_drawings_v2";
const CURRENT_KEY = "vp_current_v2";
const LEGACY_KEY = "vectorDrawings";
const SAVE_DELAY_MS = 350;

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function blank(orientation: VectorPaintOrientation, name: string): Drawing {
  const now = Date.now();
  return {
    id: newId(),
    name,
    orientation,
    strokes: [],
    createdAt: now,
    updatedAt: now,
  };
}

function nextName(drawings: Drawing[]) {
  let n = drawings.length + 1;
  while (drawings.some((d) => d.name === `Drawing ${n}`)) n++;
  return `Drawing ${n}`;
}

function toHex(color: string | null): string {
  if (!color) return "#1C1917";
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${color
      .slice(1)
      .split("")
      .map((c) => c + c)
      .join("")}`.toUpperCase();
  }
  const rgb = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgb) {
    return `#${rgb
      .slice(1, 4)
      .map((v) => Number(v).toString(16).padStart(2, "0"))
      .join("")}`.toUpperCase();
  }
  return "#1C1917";
}

function importLegacy(
  entry: { name?: string; data?: string },
  index: number,
): Drawing | null {
  if (!entry?.data) return null;
  try {
    const doc = new DOMParser().parseFromString(entry.data, "image/svg+xml");
    const root = doc.documentElement;
    if (root.tagName.toLowerCase() !== "svg") return null;
    const vb = (root.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
    const vw =
      vb.length === 4 && vb[2] > 0
        ? vb[2]
        : Number(root.getAttribute("width")) || 0;
    const vh =
      vb.length === 4 && vb[3] > 0
        ? vb[3]
        : Number(root.getAttribute("height")) || 0;
    if (!vw || !vh) return null;

    const orientation: VectorPaintOrientation =
      vw > vh ? "landscape" : "portrait";
    const page = pageSize(orientation);
    const scale = Math.min(page.w / vw, page.h / vh);
    const ox = (page.w - vw * scale) / 2;
    const oy = (page.h - vh * scale) / 2;

    const strokes: Stroke[] = [];
    doc.querySelectorAll("path").forEach((path) => {
      const nums =
        (path.getAttribute("d") ?? "")
          .match(/-?\d*\.?\d+(?:e-?\d+)?/gi)
          ?.map(Number) ?? [];
      if (nums.length < 2) return;
      const p: number[] = [];
      for (let i = 0; i + 1 < nums.length; i += 2) {
        p.push(
          Math.round((nums[i] * scale + ox) * 10) / 10,
          Math.round((nums[i + 1] * scale + oy) * 10) / 10,
        );
      }
      const width = Number(path.getAttribute("stroke-width")) || 8;
      strokes.push({
        c: toHex(path.getAttribute("stroke")),
        w: Math.min(160, Math.max(2, Math.round(width * scale * 10) / 10)),
        p,
      });
    });
    if (strokes.length === 0) return null;
    const now = Date.now() - (1000 - index);
    return {
      id: newId(),
      name: entry.name || `Drawing ${index + 1}`,
      orientation,
      strokes,
      createdAt: now,
      updatedAt: now,
    };
  } catch {
    return null;
  }
}

function readLibrary(): Drawing[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Drawing[];
      if (Array.isArray(parsed))
        return parsed.filter((d) => d && Array.isArray(d.strokes));
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const entries = JSON.parse(legacy) as Array<{
        name?: string;
        data?: string;
      }>;
      if (Array.isArray(entries)) {
        return entries
          .map(importLegacy)
          .filter((d): d is Drawing => d !== null);
      }
    }
  } catch {
    return [];
  }
  return [];
}

export function useDrawings() {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [storageFull, setStorageFull] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const drawingsRef = useRef<Drawing[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((next: Drawing[], immediate = false) => {
    drawingsRef.current = next;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const write = () => {
      try {
        localStorage.setItem(
          LIBRARY_KEY,
          JSON.stringify(
            drawingsRef.current.filter((d) => d.strokes.length > 0),
          ),
        );
        setStorageFull(false);
        setLastSavedAt(Date.now());
      } catch {
        setStorageFull(true);
      }
    };
    if (immediate) write();
    else saveTimer.current = setTimeout(write, SAVE_DELAY_MS);
  }, []);

  useEffect(() => {
    const library = readLibrary();
    let current: Drawing | undefined;
    try {
      const storedId = localStorage.getItem(CURRENT_KEY);
      current = library.find((d) => d.id === storedId);
    } catch {}
    const list = [...library];
    if (!current) {
      current = blank("portrait", nextName(list));
      list.push(current);
    }
    drawingsRef.current = list;
    setDrawings(list);
    setCurrentId(current.id);
    if (library.length > 0) persist(list, true);
  }, [persist]);

  useEffect(() => {
    if (!currentId) return;
    try {
      localStorage.setItem(CURRENT_KEY, currentId);
    } catch {}
  }, [currentId]);

  useEffect(() => {
    const flush = () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        persist(drawingsRef.current, true);
      }
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [persist]);

  const update = useCallback(
    (fn: (list: Drawing[]) => Drawing[], immediate = false) => {
      const next = fn(drawingsRef.current);
      setDrawings(next);
      persist(next, immediate);
    },
    [persist],
  );

  const saveStrokes = useCallback(
    (id: string, strokes: Stroke[]) => {
      update((list) =>
        list.map((d) =>
          d.id === id ? { ...d, strokes, updatedAt: Date.now() } : d,
        ),
      );
    },
    [update],
  );

  const create = useCallback(
    (orientation: VectorPaintOrientation) => {
      const list = drawingsRef.current.filter((d) => d.strokes.length > 0);
      const fresh = blank(orientation, nextName(list));
      update(() => [...list, fresh], true);
      setCurrentId(fresh.id);
      return fresh;
    },
    [update],
  );

  const open = useCallback(
    (id: string) => {
      update(
        (list) => list.filter((d) => d.strokes.length > 0 || d.id === id),
        true,
      );
      setCurrentId(id);
    },
    [update],
  );

  const rename = useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim().slice(0, 60);
      if (!trimmed) return;
      update(
        (list) => list.map((d) => (d.id === id ? { ...d, name: trimmed } : d)),
        true,
      );
    },
    [update],
  );

  const remove = useCallback(
    (id: string) => {
      const index = drawingsRef.current.findIndex((d) => d.id === id);
      if (index < 0) return null;
      const removed = drawingsRef.current[index];
      update((list) => list.filter((d) => d.id !== id), true);
      return { drawing: removed, index };
    },
    [update],
  );

  const restore = useCallback(
    (drawing: Drawing, index: number) => {
      update((list) => {
        const next = list.filter((d) => d.id !== drawing.id);
        next.splice(Math.min(index, next.length), 0, drawing);
        return next;
      }, true);
    },
    [update],
  );

  const setOrientation = useCallback(
    (id: string, orientation: VectorPaintOrientation) => {
      update(
        (list) =>
          list.map((d) =>
            d.id === id && d.strokes.length === 0 ? { ...d, orientation } : d,
          ),
        true,
      );
    },
    [update],
  );

  const current = drawings.find((d) => d.id === currentId) ?? null;

  return {
    drawings,
    current,
    storageFull,
    lastSavedAt,
    saveStrokes,
    create,
    open,
    rename,
    remove,
    restore,
    setOrientation,
  };
}
