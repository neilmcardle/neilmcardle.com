"use client";
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChapters } from "../hooks/useChapters";
import { useTags } from "../hooks/useTags";
import { useCover } from "../hooks/useCover";
import { useLockedSections } from "../hooks/useLockedSections";
import { useBookState } from "../hooks/useBookState";
import { useEndnotes } from "../hooks/useEndnotes";
import { useBookSwitch, type SwitchBook } from "../hooks/useBookSwitch";
import { useDocumentImport } from "../hooks/useDocumentImport";
import { useLibrary } from "../hooks/useLibrary";
import { flushEditors } from "../editor/registry";
import { bookStore } from "../storage/bookStore";
import { hasText } from "../model/text";
import { loadBookLibrary } from "../utils/bookLibrary";
import { getContentChapterNumber } from "../utils/pageUtils";
import { useSessionInternals } from "./SessionProvider";
import { useChapterActions } from "./book/useChapterActions";
import { useBackup } from "./book/useBackup";
import { useBookLifecycle } from "./book/useBookLifecycle";
import {
  usePort,
  usePublishedStore,
  useStableActions,
  useStoreSelector,
  type Store,
} from "./store";
import { BOOK_UI_FALLBACK, type BookUi } from "./types";

function useBookModel() {
  const { session, dispatchPhase, connectSync } = useSessionInternals();
  const { user, hasCloudSync, cloudSync } = session;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { port: ui, connect: connectUi } = usePort<BookUi>(BOOK_UI_FALLBACK);

  const chaptersHook = useChapters();
  const {
    chapters,
    setChapters,
    selectedChapter,
    setSelectedChapter,
    handleSelectChapter,
  } = chaptersHook;
  const tagsHook = useTags();
  const coverHook = useCover(null);
  const lockedHook = useLockedSections();
  const bookState = useBookState();
  const {
    title,
    author,
    blurb,
    currentBookId,
    setCurrentBookId,
    endnotes,
    setEndnotes,
    endnoteReferences,
    setEndnoteReferences,
    nextEndnoteNumber,
    setNextEndnoteNumber,
  } = bookState;

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [loadToken, setLoadToken] = useState(0);
  const editorSessionRef = useRef(0);
  const openBookIdRef = useRef<string | undefined>(undefined);

  useLayoutEffect(() => {
    openBookIdRef.current = currentBookId;
  });

  useLayoutEffect(() => {
    connectSync({
      openBookId: () => openBookIdRef.current,
      libraryChanged: (userId) => setLibraryBooks(loadBookLibrary(userId)),
    });
  }, [connectSync]);

  const endnotesHook = useEndnotes({
    chapters,
    setChapters,
    endnotes,
    setEndnotes,
    endnoteReferences,
    setEndnoteReferences,
    nextEndnoteNumber,
    setNextEndnoteNumber,
    selectedChapter,
    setSelectedChapter,
    setDialogState: ui.setDialogState,
  });

  const rawSwitch = useBookSwitch({
    beforeSwitch: async () => {
      if (flushEditors())
        await new Promise((resolve) => setTimeout(resolve, 0));
      await ui.flushSave();
      await bookStore.flush();
    },
    editorSessionRef,
  });
  const { cancelPendingSwitch } = rawSwitch;

  const switchBook: SwitchBook = async (steps) => {
    dispatchPhase({ type: "loadStarted" });
    let opened = false;
    try {
      return await rawSwitch.switchBook({
        ...steps,
        apply: (prepared) => {
          steps.apply(prepared);
          opened = true;
          dispatchPhase({ type: "opened" });
        },
      });
    } finally {
      if (!opened) dispatchPhase({ type: "loadAbandoned" });
    }
  };

  const docImport = useDocumentImport({
    resetMetadata: bookState.resetMetadata,
    setTitle: bookState.setTitle,
    setAuthor: bookState.setAuthor,
    setChapters,
    setSelectedChapter,
    setTags: tagsHook.setTags,
    clearCover: coverHook.clearCover,
    setSidebarView: ui.setSidebarView,
    switchBook,
  });

  const library = useLibrary({
    libraryBooks,
    setLibraryBooks,
    user,
    hasCloudSync,
    currentBookId,
    onLoaded: () => setLoadToken((token) => token + 1),
    loadMetadata: bookState.loadMetadata,
    setTags: tagsHook.setTags,
    setCoverUrl: coverHook.setCoverUrl,
    setChapters,
    setEndnoteReferences,
    setEndnotes,
    setNextEndnoteNumber,
    setCurrentBookId,
    setSelectedChapter,
    setMobileSidebarOpen: ui.setMobileSidebarOpen,
    setSidebarView: ui.setSidebarView,
    setDialogState: ui.setDialogState,
    clearEditorState: () => actions.startBlankBook(),
    switchBook,
  });

  const chapterActions = useChapterActions({
    chaptersHook,
    setEndnoteReferences,
    ui,
  });

  const backup = useBackup({
    userId: user?.id,
    setLibraryBooks,
    openBookId: () => openBookIdRef.current,
    syncNow: cloudSync.syncNow,
    ui,
  });

  const lifecycle = useBookLifecycle({
    user,
    authLoading: session.authLoading,
    phase: session.phase,
    dispatchPhase,
    initialSyncDone: cloudSync.initialSyncDone,
    searchParams,
    router,
    ui,
    chapters,
    setChapters,
    setSelectedChapter,
    meta: { title, author, blurb },
    setTitle: bookState.setTitle,
    setAuthor: bookState.setAuthor,
    resetMetadata: bookState.resetMetadata,
    setTags: tagsHook.setTags,
    coverUrl: coverHook.coverUrl,
    clearCover: coverHook.clearCover,
    currentBookId,
    setCurrentBookId,
    libraryBooks,
    setLibraryBooks,
    loadBook: library.handleLoadBook,
    cancelPendingSwitch,
    editorSessionRef,
  });

  const isBlankBook =
    chapters.length === 1 && !hasText(chapters[0].content) && !title?.trim();

  const actions = useStableActions({
    setTitle: bookState.setTitle,
    setAuthor: bookState.setAuthor,
    setBlurb: bookState.setBlurb,
    setPublisher: bookState.setPublisher,
    setPubDate: bookState.setPubDate,
    setIsbn: bookState.setIsbn,
    setLanguage: bookState.setLanguage,
    setGenre: bookState.setGenre,
    setTypography: bookState.setTypography,
    setTags: tagsHook.setTags,
    setTagInput: tagsHook.setTagInput,
    handleAddTag: tagsHook.handleAddTag,
    handleRemoveTag: tagsHook.handleRemoveTag,
    handleCoverChange: coverHook.handleCoverChange,
    setCoverUrl: coverHook.setCoverUrl,
    setChapters,
    setSelectedChapter,
    setEndnoteReferences,
    setCurrentBookId,
    setLibraryBooks,
    handleAddChapter: chaptersHook.handleAddChapter,
    handleSelectChapter,
    handleChapterTitleChange: chaptersHook.handleChapterTitleChange,
    handleChapterContentChange: chaptersHook.handleChapterContentChange,
    handleDragStart: chaptersHook.handleDragStart,
    handleDragEnter: chaptersHook.handleDragEnter,
    handleDragEnd: chaptersHook.handleDragEnd,
    handleTouchStart: chaptersHook.handleTouchStart,
    handleTouchMove: chaptersHook.handleTouchMove,
    handleTouchEnd: chaptersHook.handleTouchEnd,
    getContentChapterNumber,
    ...chapterActions,
    handleCreateEndnote: endnotesHook.handleCreateEndnote,
    setSelectedBookId,
    handleLoadBook: library.handleLoadBook,
    handleDeleteBook: library.handleDeleteBook,
    handleDeleteSelectedBooks: library.handleDeleteSelectedBooks,
    setMultiSelectMode: library.setMultiSelectMode,
    toggleBookSelection: library.toggleBookSelection,
    toggleSelectAll: library.toggleSelectAll,
    showImportDialog: docImport.showImportDialog,
    setImportDialogOpen: docImport.setImportDialogOpen,
    handleImportFileSelect: docImport.handleImportFileSelect,
    downloadBackup: backup.download,
    restoreBackup: backup.restore,
    startBlankBook: lifecycle.startBlankBook,
    startWriting: lifecycle.startWriting,
    goHome: lifecycle.goHome,
    cancelPendingSwitch,
  });

  const book = {
    chapters,
    selectedChapter,
    dragOverIndex: chaptersHook.dragOverIndex,
    dragItemIndex: chaptersHook.dragItemIndex,
    ghostPillPosition: chaptersHook.ghostPillPosition,
    title,
    author,
    blurb,
    publisher: bookState.publisher,
    pubDate: bookState.pubDate,
    isbn: bookState.isbn,
    language: bookState.language,
    genre: bookState.genre,
    typography: bookState.typography,
    tags: tagsHook.tags,
    tagInput: tagsHook.tagInput,
    coverUrl: coverHook.coverUrl,
    lockedSections: lockedHook.lockedSections,
    currentBookId,
    endnotes,
    endnoteReferences,
    libraryBooks,
    selectedBookId,
    multiSelectMode: library.multiSelectMode,
    selectedBookIds: library.selectedBookIds,
    importDialogOpen: docImport.importDialogOpen,
    importing: docImport.importing,
    importError: docImport.importError,
    importFileInputRef: docImport.importFileInputRef,
    loadToken,
    isBlankBook,
  };

  return { book, actions, connectUi, editorSessionRef };
}

export type BookModel = ReturnType<typeof useBookModel>;
export type BookState = BookModel["book"];
export type BookActions = BookModel["actions"];

const BookInternalsContext = createContext<BookModel | null>(null);
const BookStoreContext = createContext<Store<BookState> | null>(null);
const BookActionsContext = createContext<BookActions | null>(null);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const model = useBookModel();
  const store = usePublishedStore(model.book);
  return (
    <BookInternalsContext.Provider value={model}>
      <BookActionsContext.Provider value={model.actions}>
        <BookStoreContext.Provider value={store}>
          {children}
        </BookStoreContext.Provider>
      </BookActionsContext.Provider>
    </BookInternalsContext.Provider>
  );
}

export function useBookInternals() {
  const value = useContext(BookInternalsContext);
  if (!value) throw new Error("BookProvider is missing");
  return value;
}

export function useBook<S>(
  selector: (state: BookState) => S,
  equal?: (a: S, b: S) => boolean,
): S {
  const store = useContext(BookStoreContext);
  if (!store) throw new Error("BookProvider is missing");
  return useStoreSelector(store, selector, equal);
}

export function useBookActions() {
  const value = useContext(BookActionsContext);
  if (!value) throw new Error("BookProvider is missing");
  return value;
}
