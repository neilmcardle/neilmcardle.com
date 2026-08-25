"use client";

import Link from "next/link";
import { useBoards } from "@/lib/coverly/use-boards";
import { useHydrated } from "@/lib/coverly/use-hydrated";

export default function BoardsPage() {
  const boards = useBoards();
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-semibold">Your boards</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {boards.length === 0
          ? "No boards yet. Browse covers and add them to a board."
          : `${boards.length} board${boards.length === 1 ? "" : "s"}`}
      </p>

      {boards.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/coverly/boards/${board.id}`}
              className="group rounded-lg border bg-card p-4 hover:bg-card/80"
            >
              <h2 className="font-semibold group-hover:underline">
                {board.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                {board.covers.length} cover
                {board.covers.length === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
