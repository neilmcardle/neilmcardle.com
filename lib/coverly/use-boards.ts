"use client";

import { useSyncExternalStore } from "react";

export type Board = { id: string; name: string; covers: string[] };

const BOARDS_STORAGE_KEY = "coverly:boards";
const EMPTY: Board[] = [];

let snapshot: Board[] | null = null;
const listeners = new Set<() => void>();

function read(): Board[] {
  try {
    const stored = localStorage.getItem(BOARDS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getSnapshot(): Board[] {
  if (snapshot === null) snapshot = read();
  return snapshot;
}

function getServerSnapshot(): Board[] {
  return EMPTY;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function commit(next: Board[]) {
  snapshot = next;
  try {
    localStorage.setItem(BOARDS_STORAGE_KEY, JSON.stringify(next));
  } catch {}
  emit();
}

function onStorage(event: StorageEvent) {
  if (event.key !== BOARDS_STORAGE_KEY) return;
  snapshot = read();
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function useBoards(): Board[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function createBoard(name: string): Board {
  const board: Board = {
    id: `board-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    covers: [],
  };
  commit([board, ...getSnapshot()]);
  return board;
}

export type AddResult = "added" | "duplicate" | "missing";

export function addCoverToBoard(boardId: string, coverId: string): AddResult {
  const boards = getSnapshot();
  const board = boards.find((b) => b.id === boardId);
  if (!board) return "missing";
  if (board.covers.includes(coverId)) return "duplicate";
  commit(
    boards.map((b) =>
      b.id === boardId ? { ...b, covers: [...b.covers, coverId] } : b,
    ),
  );
  return "added";
}

export function removeCoverFromBoard(boardId: string, coverId: string) {
  commit(
    getSnapshot().map((board) =>
      board.id === boardId
        ? { ...board, covers: board.covers.filter((id) => id !== coverId) }
        : board,
    ),
  );
}

export function deleteBoard(boardId: string) {
  commit(getSnapshot().filter((board) => board.id !== boardId));
}
