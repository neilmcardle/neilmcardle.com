"use client";
import { useEffect, useRef } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { bookStore } from "../../storage/bookStore";
import { isBlankBook, pruneBlankBooks } from "../../utils/bookLibrary";
import { uuidv4 } from "../../utils/uuid";
import {
  isHydrated,
  showsLanding,
  type AppPhase,
  type AppPhaseEvent,
} from "../../state/appPhase";
import type { Chapter } from "../../types";
import type { BookUi } from "../types";

interface Params {
  user: { id: string } | null;
  authLoading: boolean;
  phase: AppPhase;
  dispatchPhase: (event: AppPhaseEvent) => void;
  initialSyncDone: boolean;
  searchParams: ReadonlyURLSearchParams | null;
  router: { replace: (href: string, options?: { scroll?: boolean }) => void };
  ui: BookUi;
  chapters: Chapter[];
  setChapters: (chapters: Chapter[]) => void;
  setSelectedChapter: (index: number) => void;
  meta: { title: string; author: string; blurb: string };
  setTitle: (value: string) => void;
  setAuthor: (value: string) => void;
  resetMetadata: () => void;
  setTags: (tags: string[]) => void;
  coverUrl: string | null;
  clearCover: () => void;
  currentBookId: string | undefined;
  setCurrentBookId: (id: string | undefined) => void;
  libraryBooks: any[];
  setLibraryBooks: (books: any[]) => void;
  loadBook: (id: string, keepChapter?: boolean) => Promise<void> | void;
  cancelPendingSwitch: () => void;
  editorSessionRef: React.MutableRefObject<number>;
}

export function useBookLifecycle(p: Params) {
  const autoBlankRef = useRef(false);
  const { user, chapters, setChapters, setCurrentBookId } = p;
  const hydrated = isHydrated(p.phase);
  const landing = showsLanding(p.phase);

  const prevUserRef = useRef(user);
  useEffect(() => {
    if (prevUserRef.current && !user) {
      setChapters([]);
      setCurrentBookId(undefined);
    }
    prevUserRef.current = user;
  }, [user, setChapters, setCurrentBookId]);

  function startBlankBook() {
    p.cancelPendingSwitch();
    p.editorSessionRef.current += 1;
    autoBlankRef.current = false;
    p.resetMetadata();
    p.setTags([]);
    p.clearCover();
    p.setChapters([
      {
        id: uuidv4(),
        title: "",
        content: "",
        type: "content",
      },
    ]);
    p.setSelectedChapter(0);
    p.dispatchPhase({ type: "opened" });
    p.ui.afterBlankBook();
  }

  function startWriting() {
    p.dispatchPhase({ type: "startWriting" });
    if (p.libraryBooks.length > 0) {
      const mostRecent = p.libraryBooks.reduce((a, b) =>
        a.savedAt > b.savedAt ? a : b,
      );
      p.loadBook(mostRecent.id);
    } else {
      startBlankBook();
    }
  }

  function goHome() {
    p.cancelPendingSwitch();
    p.editorSessionRef.current += 1;
    p.setChapters([]);
    p.setTitle("");
    p.setAuthor("");
    p.setCurrentBookId(undefined);
    p.setSelectedChapter(0);
    p.dispatchPhase({ type: "closed" });
    p.ui.setSidebarView(null);
  }

  useEffect(() => {
    if (!hydrated || !user) return;
    if (landing) return;
    const latest =
      p.libraryBooks.length > 0
        ? p.libraryBooks.reduce((a, b) => (a.savedAt > b.savedAt ? a : b))
        : null;
    if (chapters.length > 0) {
      const untouchedBlank =
        autoBlankRef.current &&
        !p.currentBookId &&
        !p.ui.isDirty() &&
        isBlankBook({
          title: p.meta.title,
          author: p.meta.author,
          blurb: p.meta.blurb,
          coverFile: p.coverUrl,
          chapters,
        });
      if (latest && untouchedBlank) void p.loadBook(latest.id);
      return;
    }
    if (latest) {
      void p.loadBook(latest.id);
    } else if (p.initialSyncDone) {
      startBlankBook();
      autoBlankRef.current = true;
    }
  }, [
    hydrated,
    user,
    landing,
    chapters.length,
    p.libraryBooks,
    p.initialSyncDone,
  ]);

  useEffect(() => {
    if (p.authLoading) return;
    if (!user?.id) return;

    const userId = user.id;
    let cancelled = false;
    void bookStore.hydrate(userId).then(() => {
      if (cancelled) return;
      const books = pruneBlankBooks(userId);
      p.setLibraryBooks(books);

      const loadBookId = p.searchParams ? p.searchParams.get("load") : null;
      if (loadBookId) {
        const bookToLoad = books.find((book) => book.id === loadBookId);
        if (bookToLoad) {
          p.dispatchPhase({ type: "startWriting" });
          p.loadBook(loadBookId);
          p.router.replace("/make-ebook", { scroll: false });
          p.dispatchPhase({ type: "hydrated" });
          return;
        } else {
          p.router.replace("/make-ebook", { scroll: false });
          if (!hydrated) p.dispatchPhase({ type: "hydrated" });
          return;
        }
      }

      if (!hydrated) p.dispatchPhase({ type: "hydrated" });
    });
    return () => {
      cancelled = true;
    };
  }, [
    p.authLoading,
    user?.id,
    p.searchParams,
    hydrated,
    p.currentBookId,
    chapters.length,
  ]);

  return { startBlankBook, startWriting, goHome };
}
