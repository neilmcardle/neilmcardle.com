"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { flyToBoard } from "@/lib/coverly/board-fly";
import {
  clearLastBoard,
  getLastBoard,
  rememberLastBoard,
} from "@/lib/coverly/last-board";
import {
  addCoverToBoard,
  createBoard,
  useBoards,
  type Board,
} from "@/lib/coverly/use-boards";
import { useHydrated } from "@/lib/coverly/use-hydrated";

const CONFIRM_MS = 4200;
const PICKER_OPEN_EVENT = "coverly:picker-open";

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
  const [saved, setSaved] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();

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

  const openPicker = () => {
    document.dispatchEvent(
      new CustomEvent(PICKER_OPEN_EVENT, { detail: instanceId }),
    );
    setOpen(true);
  };

  const confirm = (board: Board | null, message?: string) => {
    if (timer.current) clearTimeout(timer.current);
    setSaved(board);
    setError(message ?? null);
    timer.current = setTimeout(() => {
      setSaved(null);
      setError(null);
    }, CONFIRM_MS);
  };

  const saveTo = (board: Board) => {
    if (addCoverToBoard(board.id, coverId)) {
      flyToBoard(flyFrom());
      rememberLastBoard(board);
      setOpen(false);
      confirm(board);
    } else {
      confirm(null, "Couldn't save");
    }
  };

  const quickAdd = () => {
    const last = getLastBoard();
    if (last && boards.some((board) => board.id === last.id)) {
      const target = boards.find((board) => board.id === last.id);
      if (target) saveTo(target);
    } else {
      clearLastBoard();
      openPicker();
    }
  };

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const board = createBoard(newName.trim());
    setNewName("");
    saveTo(board);
  };

  if (!hydrated) return null;

  return (
    <div
      ref={containerRef}
      className={
        variant === "icon"
          ? "absolute right-2 top-2 z-10"
          : "relative inline-flex flex-wrap items-center gap-2"
      }
      onClick={(e) => e.stopPropagation()}
    >
      {variant === "icon" ? (
        <div className="flex overflow-hidden rounded-full opacity-0 shadow-md transition-opacity focus-within:opacity-100 group-hover/card:opacity-100">
          <button
            onClick={quickAdd}
            aria-label="Add to board"
            className="flex h-8 w-8 items-center justify-center bg-background/90 text-lg leading-none text-foreground backdrop-blur hover:bg-background"
          >
            +
          </button>
          <button
            onClick={() => (open ? setOpen(false) : openPicker())}
            aria-label="Choose board"
            aria-haspopup="menu"
            aria-expanded={open}
            className="border-l border-foreground/15 bg-background/90 px-1.5 text-xs text-foreground backdrop-blur hover:bg-background"
          >
            ▾
          </button>
        </div>
      ) : (
        <button
          onClick={quickAdd}
          className="rounded-[0.625rem] bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Add to board
        </button>
      )}

      {variant === "button" && (
        <AnimatePresence mode="wait">
          {(saved || error) && (
            <motion.div
              key={saved ? saved.id : "error"}
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${
                saved
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-600"
              }`}
            >
              {saved ? (
                <>
                  <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                  <span>Saved to</span>
                  <Link
                    href={`/coverly/boards/${saved.id}`}
                    className="font-medium underline underline-offset-2 hover:opacity-80"
                  >
                    {saved.name}
                  </Link>
                </>
              ) : (
                error
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {variant === "icon" && (saved || error) && (
        <div
          role="status"
          aria-live="polite"
          className="absolute right-0 z-30 mt-1 w-max max-w-56 rounded-[0.625rem] border bg-card px-2 py-1 text-xs shadow-md"
        >
          {saved ? `Saved · ${saved.name}` : error}
        </div>
      )}

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 w-56 rounded-[1rem] border bg-card p-2 text-left shadow-lg">
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
            <p className="p-1.5 text-xs text-muted-foreground">
              No boards yet. Create one below.
            </p>
          ) : (
            boards.map((board) => (
              <button
                key={board.id}
                onClick={() => saveTo(board)}
                className="block w-full rounded-[0.5rem] px-2 py-1.5 text-left text-xs hover:bg-muted"
              >
                {board.name}
              </button>
            ))
          )}
          <form
            className={
              boards.length === 0 ? "" : "mt-1 flex gap-1 border-t pt-1.5"
            }
            onSubmit={handleCreateBoard}
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New board"
              className="w-full rounded-[0.5rem] border bg-background px-2 py-1 text-xs"
            />
            <button
              disabled={!newName.trim()}
              className="rounded-[0.5rem] border px-2 text-xs disabled:opacity-50"
            >
              +
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
