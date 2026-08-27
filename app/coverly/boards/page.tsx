"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBoards } from "@/lib/coverly/use-boards";
import { useHydrated } from "@/lib/coverly/use-hydrated";
import { fetchCoverThumbs } from "./actions";

const PREVIEW_SLOTS = 4;

export default function BoardsPage() {
  const boards = useBoards();
  const hydrated = useHydrated();
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  const wanted = boards
    .flatMap((b) => b.covers.slice(0, PREVIEW_SLOTS))
    .join(",");

  useEffect(() => {
    if (!wanted) return;
    let live = true;
    fetchCoverThumbs(wanted.split(","))
      .then((rows) => {
        if (!live) return;
        setThumbs(Object.fromEntries(rows.map((r) => [r.id, r.image_url])));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [wanted]);

  if (!hydrated) return null;

  return (
    <div className="w-full px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold">Your boards</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        {boards.length === 0
          ? "No boards yet. Browse covers and save them to a board."
          : `${boards.length} board${boards.length === 1 ? "" : "s"}`}
      </p>

      {boards.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <p className="mb-4 text-muted-foreground">
            Start by browsing covers and saving them to boards.
          </p>
          <Link
            href="/coverly/browse"
            className="inline-block rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Browse covers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {boards.map((board) => {
            const preview = board.covers.slice(0, PREVIEW_SLOTS);
            return (
              <Link
                key={board.id}
                href={`/coverly/boards/${board.id}`}
                className="group overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md"
              >
                <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-px bg-border">
                  {Array.from({ length: PREVIEW_SLOTS }).map((_, i) => {
                    const src = preview[i] ? thumbs[preview[i]] : undefined;
                    return (
                      <div key={i} className="overflow-hidden bg-muted">
                        {src && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={src}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="p-3">
                  <h2 className="truncate font-semibold group-hover:underline">
                    {board.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {board.covers.length} cover
                    {board.covers.length === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
