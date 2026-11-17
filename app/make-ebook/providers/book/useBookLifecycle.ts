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
  const { user, chapters, setChapters, setCurrentBookId, editorSessionRef } = p;
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
    editorSessionRef.current += 1;
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
    editorSessionRef.current += 1;
    p.setChapters([]);
    p.setTitle("");
    p.setAuthor("");
    p.setCurrentBookId(undefined);
    p.setSelectedChapter(0);
    p.dispatchPhase({ type: "closed" });
    p.ui.setSidebarView(null);
  }

  const live = useRef({ p, chapters, startBlankBook, hydrated });
  useEffect(() => {
    live.current = { p, chapters, startBlankBook, hydrated };
  });

  useEffect(() => {
    const { p: lp, chapters: lch, startBlankBook: lstart } = live.current;
    if (!hydrated || !user) return;
    if (landing) return;
    const newest =
      lp.libraryBooks.length > 0
        ? lp.libraryBooks.reduce((a, b) => (a.savedAt > b.savedAt ? a : b))
        : null;
    if (lch.length > 0) {
      const untouchedBlank =
        autoBlankRef.current &&
        !lp.currentBookId &&
        !lp.ui.isDirty() &&
        isBlankBook({
          title: lp.meta.title,
          author: lp.meta.author,
          blurb: lp.meta.blurb,
          coverFile: lp.coverUrl,
          chapters: lch,
        });
      if (newest && untouchedBlank) void lp.loadBook(newest.id);
      return;
    }
    if (newest) {
      void lp.loadBook(newest.id);
    } else if (lp.initialSyncDone) {
      lstart();
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
    const lp = live.current.p;
    if (lp.authLoading) return;
    if (!user?.id) return;

    const userId = user.id;
    let cancelled = false;
    void bookStore.hydrate(userId).then(() => {
      if (cancelled) return;
      const now = live.current;
      const books = pruneBlankBooks(userId);
      now.p.setLibraryBooks(books);

      const loadBookId = now.p.searchParams
        ? now.p.searchParams.get("load")
        : null;
      if (loadBookId) {
        const bookToLoad = books.find((book) => book.id === loadBookId);
        if (bookToLoad) {
          now.p.dispatchPhase({ type: "startWriting" });
          now.p.loadBook(loadBookId);
          now.p.router.replace("/make-ebook", { scroll: false });
          now.p.dispatchPhase({ type: "hydrated" });
          return;
        } else {
          now.p.router.replace("/make-ebook", { scroll: false });
          if (!now.hydrated) now.p.dispatchPhase({ type: "hydrated" });
          return;
        }
      }

      if (!now.hydrated) now.p.dispatchPhase({ type: "hydrated" });
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
