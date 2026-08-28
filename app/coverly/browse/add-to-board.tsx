"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check, X } from "lucide-react";
import { flyToBoard, primeFlySounds } from "@/lib/coverly/board-fly";
import { rememberLastBoard } from "@/lib/coverly/last-board";
import {
  addCoverToBoard,
  createBoard,
  removeCoverFromBoard,
  useBoards,
  type Board,
} from "@/lib/coverly/use-boards";
import { useHydrated } from "@/lib/coverly/use-hydrated";
import { useMediaQuery } from "@/lib/coverly/use-media-query";

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
  const attached = useMediaQuery("(min-width: 1024px)");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [newName, setNewName] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!open) return;
    const el = popRef.current;
    if (!el) return;
    const place = () => {
      el.style.transform = "none";
      const r = el.getBoundingClientRect();
      const m = 8;
      let dx = 0;
      if (r.left < m) dx = m - r.left;
      else if (r.right > window.innerWidth - m) {
        dx = window.innerWidth - m - r.right;
      }
      const anchor = containerRef.current?.getBoundingClientRect();
      let dy = 0;
      if (anchor) {
        const needed = r.height + 12;
        const roomBelow = window.innerHeight - anchor.bottom;
        const roomAbove = anchor.top;
        if (roomBelow < needed && roomAbove >= needed) {
          dy = -(anchor.height + r.height + 12);
        }
      }
      el.style.transform =
        dx || dy
          ? `translate(${Math.round(dx)}px, ${Math.round(dy)}px)`
          : "none";
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, boards.length]);

  const flash = (next: Status) => {
    if (timer.current) clearTimeout(timer.current);
    setStatus(next);
    timer.current = setTimeout(() => setStatus(null), CONFIRM_MS);
  };

  const openPicker = () => {
    primeFlySounds();
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
          : "relative z-20 inline-flex flex-wrap items-center"
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
              layout={attached}
              initial={
                attached
                  ? { opacity: 0, x: -28 }
                  : { opacity: 0, y: 14, x: "-50%" }
              }
              animate={
                attached
                  ? { opacity: 1, x: 0 }
                  : { opacity: 1, y: 0, x: "-50%" }
              }
              exit={
                attached
                  ? { opacity: 0, x: -28 }
                  : { opacity: 0, y: 14, x: "-50%" }
              }
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 36,
                mass: 0.8,
              }}
              className={
                attached
                  ? "-ml-5 inline-flex h-9 items-center gap-1.5 rounded-l-none rounded-r-[0.625rem] bg-foreground pl-8 pr-3.5 text-xs text-background"
                  : "fixed bottom-5 left-1/2 z-50 inline-flex h-10 max-w-[calc(100vw-2rem)] items-center gap-1.5 rounded-full bg-foreground px-4 text-xs text-background shadow-xl"
              }
            >
              {status.kind === "error" ? (
                status.message
              ) : (
                <>
                  {status.kind === "saved" && (
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                  )}
                  <span>
                    {status.kind === "saved" ? "Saved to" : "Removed from"}
                  </span>
                  <Link
                    href={`/coverly/boards/${status.board.id}`}
                    className="truncate font-medium underline underline-offset-2 hover:opacity-80"
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
          className="absolute right-0 top-full z-30 mt-1 w-max max-w-56 rounded-[0.625rem] bg-foreground px-2.5 py-1.5 text-xs text-background shadow-lg"
        >
          {status.kind === "error"
            ? status.message
            : `${status.kind === "saved" ? "Saved" : "Removed"} · ${status.board.name}`}
        </div>
      )}

      {open && (
        <div
          ref={popRef}
          className="absolute right-0 top-full z-30 mt-1.5 w-60 text-left"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            className="origin-top-right rounded-[1rem] border border-border/70 bg-card/90 p-2 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl backdrop-saturate-150 dark:ring-white/10"
          >
            <div className="mb-1 flex items-center justify-between gap-2 border-b border-border/60 pb-1.5 pl-1.5">
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
              <div className="max-h-[min(50vh,15rem)] overflow-y-auto">
                {boards.map((board) => {
                  const has = board.covers.includes(coverId);
                  return (
                    <button
                      key={board.id}
                      onClick={() => toggleBoard(board)}
                      aria-label={
                        has
                          ? `Remove from ${board.name}`
                          : `Save to ${board.name}`
                      }
                      className="group/row flex w-full items-center justify-between gap-2 rounded-[0.5rem] px-2 py-1.5 text-left text-xs hover:bg-muted"
                    >
                      <span className="truncate">{board.name}</span>
                      {has && (
                        <>
                          <span className="hidden shrink-0 items-center gap-1 text-[10px] text-muted-foreground [@media(hover:hover)]:flex [@media(hover:hover)]:group-hover/row:hidden">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                            Added
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-red-600 [@media(hover:hover)]:hidden [@media(hover:hover)]:group-hover/row:inline-flex">
                            <X className="h-3 w-3" strokeWidth={2.5} />
                            Remove
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <form
              className={`flex items-center gap-1.5 ${
                boards.length === 0 ? "" : "mt-1 border-t border-border/60 pt-2"
              }`}
              onSubmit={handleCreateBoard}
            >
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Board name"
                aria-label="New board name"
                className="min-w-0 flex-1 rounded-[0.5rem] border border-border/80 bg-background/80 px-2 py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/40 focus:bg-background"
              />
              <button
                disabled={!newName.trim()}
                className="shrink-0 rounded-[0.5rem] bg-foreground px-2.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
              >
                Create
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
