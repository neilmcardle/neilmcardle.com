"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
} from "react";
import type { Chapter } from "../types";
import { useOverlays } from "../hooks/useOverlays";
import { useOnboarding } from "../hooks/useOnboarding";
import { useWordStats } from "../hooks/useWordStats";
import { useWritingGoals } from "../hooks/useWritingGoals";
import { useVersionHistory } from "../hooks/useVersionHistory";
import { useExportHistory } from "../hooks/useExportHistory";
import { useBookMind } from "../hooks/useBookMind";
import { useFocusMode } from "../hooks/useFocusMode";
import { useTypewriterMode, useParagraphFocus } from "../hooks/useFocusEffects";
import { useFindReplace } from "../hooks/useFindReplace";
import { useEditorShortcuts } from "../hooks/useKeyboardShortcuts";
import { bookStore } from "../storage/bookStore";
import { isBlankBook } from "../utils/bookLibrary";
import { isSaveFailure, snapshotsVersion } from "../state/save";
import { useSessionInternals } from "./SessionProvider";
import { useBookInternals } from "./BookProvider";
import { useEditorUi } from "./editor/useEditorUi";
import { useWritingAssist } from "./editor/useWritingAssist";
import { useSaveStatus } from "./editor/useSaveStatus";
import {
  usePublishedStore,
  useStableActions,
  useStoreSelector,
  type Store,
} from "./store";

function useEditorModel() {
  const { session, connectSync } = useSessionInternals();
  const bookModel = useBookInternals();
  const { book, actions: bookActions, connectUi } = bookModel;
  const { user, hasBookMind } = session;
  const { chapters, selectedChapter, currentBookId, title, author, blurb } =
    book;

  const overlays = useOverlays();
  const {
    setMobileSidebarOpen,
    setNewBookConfirmOpen,
    setHistoryModal,
    setPreflightFormat,
    setDialogState,
  } = overlays;

  const ui = useEditorUi();
  const { setSidebarView, setSurfaceMode } = ui.actions;

  const assist = useWritingAssist({
    hasBookMind,
    selectedChapter,
    handleChapterContentChange: bookActions.handleChapterContentChange,
  });

  const onboarding = useOnboarding({
    userId: user?.id,
    stepCallbacks: {
      "book-details": () => setSidebarView("book"),
      chapters: () => setSidebarView("chapters"),
      editor: () => setSidebarView(null),
      preview: () => {
        setSidebarView(null);
        setSurfaceMode("preview");
      },
      export: () => setSidebarView("book"),
      "auto-save": () => setSidebarView(null),
      "mobile-menu": () => {},
      "mobile-editor": () => setMobileSidebarOpen(false),
      "mobile-preview": () => setMobileSidebarOpen(false),
    },
  });

  const { bookStats, sessionStats } = useWordStats(chapters, user?.id);
  const writingGoals = useWritingGoals({
    userId: user?.id,
    wordsThisSession: sessionStats.wordsThisSession,
  });

  const versionHistory = useVersionHistory({
    bookId: currentBookId,
    userId: user?.id,
  });

  const exportHistory = useExportHistory({
    bookId: currentBookId,
    maxExports: 5,
  });

  const bookMind = useBookMind({ bookId: currentBookId, userId: user?.id });

  const save = useSaveStatus({
    session,
    bookModel,
    setDialogState,
    newBookConfirmOpen: overlays.newBookConfirmOpen,
    setNewBookConfirmOpen,
    setEpubBlob: ui.actions.setEpubBlob,
    setShowEPUBReader: overlays.setShowEPUBReader,
    closeExportHistoryModal: () => setHistoryModal(null),
    saveVersion: versionHistory.saveVersion,
    saveExport: exportHistory.saveExport,
    exportHistory: exportHistory.exports,
    getExportBlob: exportHistory.getExportBlob,
  });
  const { saveBook, markDirty, markClean } = save;

  const focus = useFocusMode();
  useTypewriterMode(focus.active && focus.settings.typewriterMode);
  useParagraphFocus(focus.active && focus.settings.paragraphFocus);

  useEffect(() => {
    if (focus.active && focus.settings.hideChrome) {
      setSidebarView(null);
      setSurfaceMode("edit");
    }
  }, [focus.active, focus.settings.hideChrome, setSidebarView, setSurfaceMode]);

  const findReplace = useFindReplace(
    chapters,
    bookActions.handleChapterContentChange,
    bookActions.handleSelectChapter,
  );

  useEditorShortcuts({
    onSave: () => {
      saveBook.handleSaveBook();
    },
    onExport: () => {
      setPreflightFormat("epub");
    },
    onPreview: () => {
      setSurfaceMode((prev) => (prev === "preview" ? "edit" : "preview"));
    },
    onNewChapter: () => {
      bookActions.handleAddChapter("content", "");
    },
    onFindReplace: () => {
      if (findReplace.isOpen) {
        findReplace.close();
      } else {
        findReplace.open();
      }
    },
    enabled: chapters.length > 0,
  });

  const handleRestoreVersion = useCallback(
    (
      restoredChapters: Chapter[],
      metadata: {
        blurb?: string;
        publisher?: string;
        pubDate?: string;
        genre?: string;
        tags?: string[];
      },
    ) => {
      setDialogState({
        open: true,
        title: "Restore Version",
        message: "Restore this version? Your current work will be replaced.",
        variant: "destructive",
        confirmLabel: "Restore",
        onConfirm: () => {
          setDialogState((prev) => ({ ...prev, open: false }));
          bookActions.setChapters(restoredChapters);
          if (metadata.blurb) bookActions.setBlurb(metadata.blurb);
          if (metadata.publisher) bookActions.setPublisher(metadata.publisher);
          if (metadata.pubDate) bookActions.setPubDate(metadata.pubDate);
          if (metadata.genre) bookActions.setGenre(metadata.genre);
          if (metadata.tags) bookActions.setTags(metadata.tags);
          bookActions.setSelectedChapter(0);
          setHistoryModal(null);
          markDirty();
        },
      });
    },
    [bookActions, setDialogState, setHistoryModal, markDirty],
  );

  function showNewBookConfirmation() {
    const blank = isBlankBook({
      title,
      author,
      blurb,
      coverFile: book.coverUrl,
      chapters,
    });
    if (!save.status.isDirty || blank) {
      void startNewBook(false);
      return;
    }
    setNewBookConfirmOpen(true);
  }

  async function startNewBook(saveFirst: boolean) {
    if (saveFirst) {
      const snapshot = saveBook.saveVersionSnapshot;
      const result = await saveBook.saveBookDirectly(false);
      if (isSaveFailure(result)) return;
      if (snapshotsVersion(result)) snapshot();
    } else {
      markClean();
    }
    setNewBookConfirmOpen(false);
    bookActions.startBlankBook();
  }

  function startTour(delayWithBook: number) {
    onboarding.resetOnboarding();
    if (chapters.length === 0) bookActions.startBlankBook();
    setTimeout(
      () => onboarding.startTour(),
      chapters.length === 0 ? 800 : delayWithBook,
    );
  }

  const actions = useStableActions({
    setMobileSidebarOpen,
    setMobileBookMindOpen: overlays.setMobileBookMindOpen,
    setChaptersSheetOpen: overlays.setChaptersSheetOpen,
    setNewBookConfirmOpen,
    setExportUpgradeOpen: overlays.setExportUpgradeOpen,
    setShowEPUBReader: overlays.setShowEPUBReader,
    setHistoryModal,
    setPreflightFormat,
    setDialogState,
    ...ui.actions,
    ...assist.actions,
    handleRestoreVersion,
    showNewBookConfirmation,
    startNewBook,
    startTour,
    flushSave: save.flushSave,
    saveNow: () => void saveBook.saveBookDirectly(false),
    handleSaveAsNewVersion: saveBook.handleSaveAsNewVersion,
    handlePreviewExport: saveBook.handlePreviewExport,
    handleDownloadExport: saveBook.handleDownloadExport,
    handleExportEPUB: saveBook.handleExportEPUB,
    handleExportPDF: saveBook.handleExportPDF,
    handleExportDocx: saveBook.handleExportDocx,
    deleteVersion: versionHistory.deleteVersion,
    clearVersions: versionHistory.clearHistory,
    deleteExport: exportHistory.deleteExport,
    clearExports: exportHistory.clearHistory,
    toggleFocusMode: focus.toggleFocusMode,
    exitFocusMode: focus.exitFocusMode,
    setFocusSetting: focus.setSetting,
  });

  useLayoutEffect(() => {
    connectUi({
      setDialogState,
      setSidebarView,
      setMobileSidebarOpen,
      markDirty,
      isDirty: () => save.status.isDirty,
      flushSave: save.flushSave,
      reloadOpenBook: save.reloadOpenBook,
      afterBlankBook: () => {
        setSidebarView(null);
        if (!onboarding.isOnboardingComplete) {
          setTimeout(() => onboarding.startTour(), 800);
        }
      },
    });
    connectSync({ openBookUpdated: save.reloadOpenBook });
  });

  useEffect(() => {
    const flush = () => {
      void bookStore.flush();
      void actions.flushSave().finally(() => void bookStore.flush());
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", flush);
    };
  }, [actions]);

  const editor = {
    mobileSidebarOpen: overlays.mobileSidebarOpen,
    mobileBookMindOpen: overlays.mobileBookMindOpen,
    chaptersSheetOpen: overlays.chaptersSheetOpen,
    newBookConfirmOpen: overlays.newBookConfirmOpen,
    exportUpgradeOpen: overlays.exportUpgradeOpen,
    showEPUBReader: overlays.showEPUBReader,
    historyModal: overlays.historyModal,
    preflightFormat: overlays.preflightFormat,
    dialogState: overlays.dialogState,
    ...ui.state,
    ...assist.state,
    openChapter: chapters[selectedChapter],
    onboarding: {
      isTourActive: onboarding.isTourActive,
      currentStep: onboarding.currentStep,
      totalSteps: onboarding.totalSteps,
      currentStepData: onboarding.currentStepData,
      nextStep: onboarding.nextStep,
      prevStep: onboarding.prevStep,
      skipTour: onboarding.skipTour,
    },
    bookStats,
    sessionStats,
    todayWords: writingGoals.todayWords,
    versions: versionHistory.versions,
    exportHistory: exportHistory.exports,
    exportHistoryLoading: exportHistory.isLoading,
    bookMind,
    save: { ...save.status, cloudPending: saveBook.cloudPending },
    focus: { active: focus.active, settings: focus.settings },
    findReplace,
  };

  return { editor, actions };
}

export type EditorModel = ReturnType<typeof useEditorModel>;
export type EditorState = EditorModel["editor"];
export type EditorActions = EditorModel["actions"];

const EditorStoreContext = createContext<Store<EditorState> | null>(null);
const EditorActionsContext = createContext<EditorActions | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const model = useEditorModel();
  const store = usePublishedStore(model.editor);
  return (
    <EditorActionsContext.Provider value={model.actions}>
      <EditorStoreContext.Provider value={store}>
        {children}
      </EditorStoreContext.Provider>
    </EditorActionsContext.Provider>
  );
}

export function useEditor<S>(
  selector: (state: EditorState) => S,
  equal?: (a: S, b: S) => boolean,
): S {
  const store = useContext(EditorStoreContext);
  if (!store) throw new Error("EditorProvider is missing");
  return useStoreSelector(store, selector, equal);
}

export function useEditorActions() {
  const value = useContext(EditorActionsContext);
  if (!value) throw new Error("EditorProvider is missing");
  return value;
}
