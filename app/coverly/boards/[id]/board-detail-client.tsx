"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Loader2, TriangleAlert, Trash2 } from "lucide-react";
import { type CoverCard } from "@/lib/coverly/queries";
import { deleteBoard, useBoards } from "@/lib/coverly/use-boards";
import { useHydrated } from "@/lib/coverly/use-hydrated";
import { fetchBoardCovers } from "./actions";

export function BoardDetailClient({ boardId }: { boardId: string }) {
  const router = useRouter();
  const boards = useBoards();
  const hydrated = useHydrated();
  const [covers, setCovers] = useState<CoverCard[] | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const board = boards.find((b) => b.id === boardId) ?? null;
  const coverKey = board ? board.covers.join(",") : "";

  useEffect(() => {
    if (!coverKey) return;
    let live = true;
    fetchBoardCovers(coverKey.split(","))
      .then((data) => {
        if (live) setCovers(data ?? []);
      })
      .catch(() => {
        if (live) setCovers([]);
      });
    return () => {
      live = false;
    };
  }, [coverKey]);

  const handleExport = async () => {
    if (!board || exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      const res = await fetch("/api/coverly/deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardName: board.name, coverIds: board.covers }),
      });
      if (!res.ok) {
        const info = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setExportError(info?.error ?? "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${board.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-comps.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    if (!board || !confirm(`Delete board "${board.name}"?`)) return;
    deleteBoard(board.id);
    router.push("/coverly/boards");
  };

  const resolved = coverKey ? covers : [];

  if (!hydrated || (board && resolved === null)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-48 rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
        <p className="mb-4 text-muted-foreground">Board not found</p>
        <Link
          href="/coverly/boards"
          className="inline-block rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Back to boards
        </Link>
      </div>
    );
  }

  const list = resolved ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{board.name}</h1>
          <p className="text-sm text-muted-foreground">
            {list.length} cover{list.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={exporting || list.length === 0}
              className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <Download className="h-4 w-4" strokeWidth={2} />
              )}
              {exporting ? "Building deck…" : "Export PDF"}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
              Delete
            </button>
          </div>
          {exportError && (
            <p
              role="status"
              aria-live="assertive"
              className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-600"
            >
              <TriangleAlert className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              {exportError}
            </p>
          )}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <p className="mb-4 text-muted-foreground">
            No covers in this board yet.
          </p>
          <Link
            href="/coverly/browse"
            className="inline-block rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Browse and add covers
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((cover) => (
            <Link
              key={cover.id}
              href={`/coverly/covers/${cover.id}`}
              className="group overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="aspect-[2/3] overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover.image_url}
                  alt={cover.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-xs font-medium">
                  {cover.title}
                </p>
                <p className="line-clamp-1 text-2xs text-muted-foreground">
                  {cover.author}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
