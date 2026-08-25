"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check, X } from "lucide-react";
import { flyToBoard } from "@/lib/coverly/board-fly";
import { rememberLastBoard } from "@/lib/coverly/last-board";
import {
  addCoverToBoard,
  createBoard,
  removeCoverFromBoard,
  useBoards,
  type Board,
} from "@/lib/coverly/use-boards";
import { useHydrated } from "@/lib/coverly/use-hydrated";

const CONFIRM_MS = 4200;
const PICKER_OPEN_EVENT = "coverly:picker-open";

type Status =
  | { kind: "saved"; board: Board }
  | { kind: "removed"; board: Board }
  | { kind: "error"; message: string };

export function AddToBoard({
  coverId,
  variant = "icon",
  flyFrom,
}: {
  coverId: string;
  variant?: "icon" | "button";
  flyFrom: () => HTMLImageElement | null;
}) {
  const boards = useBoards();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [newName, setNewName] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();

  const holding = boards.filter((b) => b.covers.includes(coverId));
  const isSaved = holding.length > 0;

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onOtherPickerOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== instanceId) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener(PICKER_OPEN_EVENT, onOtherPickerOpen);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener(PICKER_OPEN_EVENT, onOtherPickerOpen);
    };
  }, [open, instanceId]);

  const flash = (next: Status) => {
    if (timer.current) clearTimeout(timer.current);
    setStatus(next);
    timer.current = setTimeout(() => setStatus(null), CONFIRM_MS);
  };

  const openPicker = () => {
    document.dispatchEvent(
      new CustomEvent(PICKER_OPEN_EVENT, { detail: instanceId }),
    );
    setOpen(true);
  };

  const toggleBoard = (board: Board) => {
    setOpen(false);
    if (board.covers.includes(coverId)) {
      removeCoverFromBoard(board.id, coverId);
      flash({ kind: "removed", board });
      return;
    }
    const result = addCoverToBoard(board.id, coverId);
    if (result === "added") {
      flyToBoard(flyFrom());
      rememberLastBoard(board);
      flash({ kind: "saved", board });
    } else {
      flash({ kind: "error", message: "Couldn't save" });
    }
  };

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const board = createBoard(newName.trim());
    setNewName("");
    toggleBoard(board);
  };

  if (!hydrated) return null;

  const label = isSaved
    ? `Saved to ${holding.map((b) => b.name).join(", ")}`
    : "Save to board";

  return (
    <div
      ref={containerRef}
      className={
        variant === "icon"
          ? "absolute right-2 top-2 z-10"
          : "relative inline-flex flex-wrap items-center"
      }
      onClick={(e) => e.stopPropagation()}
    >
      {variant === "icon" ? (
        <button
          onClick={() => (open ? setOpen(false) : openPicker())}
          aria-label={label}
          title={label}
          aria-haspopup="menu"
          aria-expanded={open}
          className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md backdrop-blur transition-opacity hover:bg-background ${
            isSaved
              ? "bg-background/90 text-foreground opacity-100"
              : "bg-background/90 text-foreground opacity-0 focus-visible:opacity-100 group-hover/card:opacity-100"
          }`}
        >
          <Bookmark
            className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
            strokeWidth={2}
          />
        </button>
      ) : (
        <button
          onClick={() => (open ? setOpen(false) : openPicker())}
          aria-haspopup="menu"
          aria-expanded={open}
          className="relative z-10 flex items-center gap-2 rounded-[0.625rem] bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          <Bookmark
            className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
            strokeWidth={2}
          />
          {isSaved ? "Saved" : "Save to board"}
        </button>
      )}

      {variant === "button" && (
        <AnimatePresence mode="wait">
          {status && (
            <motion.div
              key={
                status.kind === "error"
                  ? "error"
                  : status.board.id + status.kind
              }
              role="status"
              aria-live="polite"
              layout
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 36,
                mass: 0.8,
              }}
              className={`-ml-5 inline-flex h-9 items-center gap-1.5 rounded-l-none rounded-r-[0.625rem] pl-8 pr-3.5 text-xs ${
                status.kind === "saved"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : status.kind === "removed"
                    ? "bg-muted text-muted-foreground"
                    : "bg-red-500/10 text-red-600"
              }`}
            >
              {status.kind === "error" ? (
                status.message
              ) : (
                <>
                  {status.kind === "saved" ? (
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                  ) : (
                    <X className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                  )}
                  <span>
                    {status.kind === "saved" ? "Saved to" : "Removed from"}
                  </span>
                  <Link
                    href={`/coverly/boards/${status.board.id}`}
                    className="font-medium underline underline-offset-2 hover:opacity-80"
                  >
                    {status.board.name}
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {variant === "icon" && status && (
        <div
          role="status"
          aria-live="polite"
          className="absolute right-0 top-full z-30 mt-1 w-max max-w-56 rounded-[0.625rem] border bg-card px-2 py-1 text-xs shadow-md"
        >
          {status.kind === "error"
            ? status.message
            : `${status.kind === "saved" ? "Saved" : "Removed"} · ${status.board.name}`}
        </div>
      )}

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 w-60 rounded-[1rem] border bg-card p-2 text-left shadow-lg">
          <div className="mb-1 flex items-center justify-between gap-2 border-b pb-1.5 pl-1.5">
            <span className="text-xs font-medium">Save to board</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex h-5 w-5 items-center justify-center rounded-[0.4rem] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          {boards.length === 0 ? (
            <p className="px-1.5 pb-2 text-xs text-muted-foreground">
              No boards yet — name one to get started.
            </p>
          ) : (
            boards.map((board) => {
              const has = board.covers.includes(coverId);
              return (
                <button
                  key={board.id}
                  onClick={() => toggleBoard(board)}
                  aria-label={
                    has ? `Remove from ${board.name}` : `Save to ${board.name}`
                  }
                  className="group/row flex w-full items-center justify-between gap-2 rounded-[0.5rem] px-2 py-1.5 text-left text-xs hover:bg-muted"
                >
                  <span className="truncate">{board.name}</span>
                  {has && (
                    <>
                      <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground group-hover/row:hidden">
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                        Added
                      </span>
                      <span className="hidden shrink-0 items-center gap-1 text-[10px] font-medium text-red-600 group-hover/row:inline-flex">
                        <X className="h-3 w-3" strokeWidth={2.5} />
                        Remove
                      </span>
                    </>
                  )}
                </button>
              );
            })
          )}

          <form
            className={`flex items-center gap-1.5 ${
              boards.length === 0 ? "" : "mt-1 border-t pt-2"
            }`}
            onSubmit={handleCreateBoard}
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Board name"
              aria-label="New board name"
              className="min-w-0 flex-1 rounded-[0.5rem] border border-border bg-background px-2 py-1.5 text-xs outline-none placeholder:text-muted-foreground/70 focus:border-foreground/40"
            />
            <button
              disabled={!newName.trim()}
              className="shrink-0 rounded-[0.5rem] bg-foreground px-2.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Create
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
