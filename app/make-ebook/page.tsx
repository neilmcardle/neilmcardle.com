"use client";
import React, {
  Suspense,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";
import { track } from "@vercel/analytics";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFeatureAccess } from "@/lib/hooks/useSubscription";
import { useSearchParams, useRouter } from "next/navigation";
import {
  PlusIcon,
  TrashIcon,
  SaveIcon,
  DownloadIcon,
} from "./components/icons";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import MarketingLandingPage from "./components/MarketingLandingPage";
import { BrandLoader } from "./components/marketing/brand/BrandLoader";
import { LANGUAGES, today } from "./utils/constants";
import { Chapter } from "./types";
import { useChapters } from "./hooks/useChapters";
import { useTags } from "./hooks/useTags";
import { useCover } from "./hooks/useCover";
import { useLockedSections } from "./hooks/useLockedSections";
import { useAutoSave, useUnsavedChangesWarning } from "./hooks/useAutoSave";
import { useEditorShortcuts } from "./hooks/useKeyboardShortcuts";
import { useBookState } from "./hooks/useBookState";
import { autoFixAllChapters } from "./utils/typographyFixer";
import EditorLeftNav from "./components/EditorLeftNav";
import CollapsibleSection from "./components/CollapsibleSection";
import MobileTabBar from "./components/mobile/MobileTabBar";
import ChaptersSheet from "./components/mobile/ChaptersSheet";
import ChaptersPanel from "./components/sidebar/ChaptersPanel";
import LibraryPanel from "./components/sidebar/LibraryPanel";
import BookDetailsPanel from "./components/sidebar/BookDetailsPanel";
import DrawerSection from "./components/mobile/DrawerSection";
import SelectionActionBar from "./components/mobile/SelectionActionBar";
import SyncConflictBanner from "./components/sidebar/SyncConflictBanner";
import InspectorPanel from "./components/bookmind/InspectorPanel";
import FloatingBookMindWindow from "./components/FloatingBookMindWindow";
import InlineEditPopover, {
  InlineEditRequest,
} from "./components/bookmind/InlineEditPopover";
import ComposePalette, {
  ComposePaletteRequest,
} from "./components/bookmind/ComposePalette";
import GhostTextOverlay from "./components/bookmind/GhostTextOverlay";
import PreflightExportDialog, {
  ExportFormat,
} from "./components/PreflightExportDialog";
import UpgradeModal from "./components/UpgradeModal";

import { toast } from "sonner";
import EditorCanvas from "./components/EditorCanvas";
import PreviewSurface from "./components/PreviewSurface";
import { useKeyboardInset } from "./hooks/useKeyboardInset";
import ChapterPanel from "./components/ChapterPanel";
import studio from "./styles/studio.module.css";
import EditorHeader from "./components/EditorHeader";
import TrialBanner from "./components/TrialBanner";
import { useWordStats } from "./hooks/useWordStats";
import { uuidv4 } from "./utils/uuid";
import { useWritingGoals } from "./hooks/useWritingGoals";
import { useVersionHistory } from "./hooks/useVersionHistory";
import { useExportHistory } from "./hooks/useExportHistory";
import HistoryPanel from "./components/HistoryPanel";
import EPUBReaderModal from "./components/EPUBReaderModal";
import ConfirmDialog from "./components/ConfirmDialog";
import FindReplacePanel from "./components/FindReplacePanel";
import { useFindReplace } from "./hooks/useFindReplace";
import { useOnboarding } from "./hooks/useOnboarding";
import OnboardingTour from "./components/OnboardingTour";
import { loadBookLibrary, loadBookById } from "./utils/bookLibrary";

import { ensureAnalyticalCache } from "./utils/analyticalCache";
import type { AnalyticalKind } from "./utils/bookmindMemory";
import { ensureBookProfile } from "./utils/bookmindProfile";

import { getContentChapterNumber } from "./utils/pageUtils";
import { UserDropdownMobile } from "./components/UserDropdownMobile";

import { useEndnotes } from "./hooks/useEndnotes";
import { useSaveBook } from "./hooks/useSaveBook";
import { useDocumentImport } from "./hooks/useDocumentImport";
import { useLibrary } from "./hooks/useLibrary";
import { useCloudSync } from "./hooks/useCloudSync";
import { useFocusMode } from "./hooks/useFocusMode";
import { useTypewriterMode, useParagraphFocus } from "./hooks/useFocusEffects";
import { FocusModePanel } from "./components/FocusModePanel";
import { AmbientPlayer } from "./components/AmbientPlayer";
import { useSignupConversion } from "@/lib/hooks/useSignupConversion";

function MakeEbookPage() {
  const { user, signOut, loading: authLoading } = useAuth();

  useSignupConversion();

  const hasCloudSync = useFeatureAccess("cloud_sync");
  const hasBookMind = useFeatureAccess("book_mind_ai");
  const isPro = hasBookMind;

  const [preflightFormat, setPreflightFormat] = useState<ExportFormat | null>(
    null,
  );
  const [exportUpgradeOpen, setExportUpgradeOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!user?.id || typeof window === "undefined") return;
    const flagKey = `mf_editor_opened_${user.id}`;
    if (!localStorage.getItem(flagKey)) {
      localStorage.setItem(flagKey, "1");
      track("editor_opened_first_time");
    }
  }, [user?.id]);

  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.get("checkout") === "success") {
      const type = searchParams.get("type") === "lifetime" ? "lifetime" : "pro";
      track("checkout_completed", { tier: type });
      router.replace("/make-ebook");
    }
  }, [searchParams, router]);

  const {
    chapters,
    setChapters,
    selectedChapter,
    setSelectedChapter,
    handleAddChapter,
    handleSelectChapter,
    handleChapterTitleChange,
    handleChapterContentChange,
    handleRemoveChapter: handleRemoveChapterRaw,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging,
    dragOverIndex,
    ghostPillPosition,
    ghostPillContent,
    dragItemIndex,
  } = useChapters();

  const findReplace = useFindReplace(
    chapters,
    handleChapterContentChange,
    handleSelectChapter,
  );

  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
    null,
  );

  const handleRemoveChapter = useCallback(
    (idx: number) => {
      handleRemoveChapterRaw(idx, (message, onConfirm) => {
        setDialogState({
          open: true,
          title: "Delete Chapter",
          message,
          variant: "destructive",
          confirmLabel: "Delete",
          onConfirm: () => {
            setDialogState((prev) => ({ ...prev, open: false }));
            const deletedChapterId = chapters[idx]?.id;
            onConfirm();
            if (deletedChapterId) {
              setEndnoteReferences((prev) =>
                prev.filter((ref) => ref.chapterId !== deletedChapterId),
              );
            }
          },
        });
      });
    },
    [handleRemoveChapterRaw, chapters],
  );

  const confirmChapterDelete = useCallback(
    (idx: number) => {
      const deletedChapterId = chapters[idx]?.id;
      handleRemoveChapterRaw(idx);
      if (deletedChapterId) {
        setEndnoteReferences((prev) =>
          prev.filter((ref) => ref.chapterId !== deletedChapterId),
        );
      }
      setPendingDeleteIndex(null);
    },
    [handleRemoveChapterRaw, chapters],
  );

  useEffect(() => {
    if (pendingDeleteIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPendingDeleteIndex(null);
    };
    const onPointer = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-chapter-delete-confirm]")) return;
      setPendingDeleteIndex(null);
    };
    const timer = window.setTimeout(() => setPendingDeleteIndex(null), 5000);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [pendingDeleteIndex]);

  const prevUserRef = useRef(user);
  useEffect(() => {
    if (prevUserRef.current && !user) {
      setChapters([]);
      setShowMarketingPage(true);
      setCurrentBookId(undefined);
    }

    if (!prevUserRef.current && user) {
      setShowMarketingPage(false);
    }
    prevUserRef.current = user;
  }, [user, setChapters]);

  const {
    tags,
    setTags,
    tagInput,
    setTagInput,
    handleAddTag,
    handleRemoveTag,
  } = useTags();

  const { coverUrl, setCoverUrl, handleCoverChange, clearCover } =
    useCover(null);

  const { lockedSections, setLockedSections, toggleSection } =
    useLockedSections();

  const [tab, setTab] = useState<"setup" | "ai" | "preview" | "library">(
    "setup",
  );
  const [sidebarView, setSidebarView] = useState<
    "library" | "book" | "chapters" | null
  >(null);

  const isPanelOpen = sidebarView !== null;

  const [surfaceMode, setSurfaceMode] = useState<"edit" | "preview">("edit");

  const [bookMindOpen, setBookMindOpen] = useState(false);

  const [selectedEditorText, setSelectedEditorText] = useState<
    string | undefined
  >(undefined);
  const [cmdkHintRect, setCmdkHintRect] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const cmdkHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;

      const node = sel.anchorNode;
      const editorEl = node?.parentElement?.closest?.(
        '[contenteditable="true"]',
      );
      if (!editorEl) return;
      const text = sel.toString().trim();
      if (text && text.length > 10) {
        setSelectedEditorText(text);

        try {
          const node = sel?.anchorNode;
          const editorEl = node?.parentElement?.closest?.(
            '[contenteditable="true"]',
          );
          if (editorEl && sel && sel.rangeCount > 0) {
            const rect = sel.getRangeAt(0).getBoundingClientRect();
            setCmdkHintRect({ top: rect.bottom + 6, left: rect.left });

            if (cmdkHintTimer.current) clearTimeout(cmdkHintTimer.current);
            cmdkHintTimer.current = setTimeout(
              () => setCmdkHintRect(null),
              3000,
            );
          }
        } catch {
          /* ignore */
        }
      } else {
        setCmdkHintRect(null);
      }
    };
    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
      if (cmdkHintTimer.current) clearTimeout(cmdkHintTimer.current);
    };
  }, []);

  const [inlineEditRequest, setInlineEditRequest] = useState<InlineEditRequest>(
    {
      open: false,
      anchorRect: null,
      selectedText: "",
      range: null,
    },
  );

  const [flowMode, setFlowMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("me_flow_mode") === "1";
  });
  const handleToggleFlowMode = useCallback(() => {
    setFlowMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("me_flow_mode", next ? "1" : "0");
      } catch {
        /* quota */
      }
      return next;
    });
  }, []);

  const handleGhostAccept = useCallback((text: string) => {
    const editorEl = document.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement | null;
    if (editorEl) editorEl.focus();
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
    document.execCommand("insertHTML", false, escaped);
  }, []);

  const [composeRequest, setComposeRequest] = useState<ComposePaletteRequest>({
    open: false,
    anchorRect: null,
    range: null,
  });

  const handleComposeRequest = useCallback(
    (args: { range: Range; rect: DOMRect }) => {
      if (!hasBookMind) return;
      setComposeRequest({
        open: true,
        anchorRect: args.rect,
        range: args.range,
      });
    },
    [hasBookMind],
  );

  const handleComposeClose = useCallback(() => {
    setComposeRequest((prev) => ({ ...prev, open: false }));
  }, []);

  const handleComposeInsert = useCallback(
    (text: string) => {
      const editorEl = document.querySelector(
        '[contenteditable="true"]',
      ) as HTMLElement | null;
      if (editorEl) editorEl.focus();

      const range = composeRequest.range;
      if (range) {
        const sel = window.getSelection();
        if (sel) {
          try {
            sel.removeAllRanges();
            sel.addRange(range);
          } catch {
            // Range detached from DOM (rare — editor re-rendered).
            // Fall through; insertHTML will land at whatever the
            // browser considers the current caret.
          }

          const node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent ?? "";
            const charBefore =
              range.startOffset > 0 ? text.charAt(range.startOffset - 1) : "";
            if (charBefore === "/") {
              range.setStart(node, range.startOffset - 1);
              range.setEnd(node, range.startOffset);
              sel.removeAllRanges();
              sel.addRange(range);
              document.execCommand("delete");
            }
          }
        }
      }

      const highlightId = `bm-compose-${Date.now()}`;
      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br>");
      const html = `<span id="${highlightId}" class="bm-edit-highlight">${escaped}</span>`;
      document.execCommand("insertHTML", false, html);

      setTimeout(() => {
        const el = document.getElementById(highlightId);
        if (el && el.parentNode) {
          while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
          el.parentNode.removeChild(el);
          if (editorEl) {
            editorEl.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
      }, 2200);
    },
    [composeRequest.range],
  );

  const handleInlineEditRequest = useCallback(
    (args: {
      selectedText: string;
      range: Range;
      rect: DOMRect;
      instruction?: string;
    }) => {
      if (!hasBookMind) return;
      setInlineEditRequest({
        open: true,
        anchorRect: args.rect,
        selectedText: args.selectedText,
        range: args.range,
        initialInstruction: args.instruction,
      });
    },
    [hasBookMind],
  );

  const handleInlineEditClose = useCallback(() => {
    setInlineEditRequest((prev) => ({ ...prev, open: false }));
  }, []);

  const handleInlineEditAccept = useCallback(
    (newText: string) => {
      const range = inlineEditRequest.range;
      if (!range) return;

      const preEditContent = chapters[selectedChapter]?.content ?? "";
      const chapterIdx = selectedChapter;

      const editorEl = document.querySelector(
        '[contenteditable="true"]',
      ) as HTMLElement | null;
      if (editorEl) editorEl.focus();

      const sel = window.getSelection();
      if (!sel) return;
      sel.removeAllRanges();
      sel.addRange(range);

      const highlightId = `bm-edit-${Date.now()}`;
      const escaped = newText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
      const html = `<span id="${highlightId}" class="bm-edit-highlight">${escaped}</span>`;
      document.execCommand("insertHTML", false, html);

      setTimeout(() => {
        const el = document.getElementById(highlightId);
        if (el && el.parentNode) {
          while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
          el.parentNode.removeChild(el);

          if (editorEl) {
            const evt = new Event("input", { bubbles: true });
            editorEl.dispatchEvent(evt);
          }
        }
      }, 2200);

      toast.success("Edit applied", {
        description: "The rewrite is highlighted in the text.",
        action: {
          label: "Undo",
          onClick: () => {
            handleChapterContentChange(chapterIdx, preEditContent);
            if (editorEl) {
              editorEl.innerHTML = preEditContent;
              const evt = new Event("input", { bubbles: true });
              editorEl.dispatchEvent(evt);
            }
            toast("Edit undone");
          },
        },
      });
    },
    [
      inlineEditRequest.range,
      chapters,
      selectedChapter,
      handleChapterContentChange,
    ],
  );

  const {
    title,
    setTitle,
    author,
    setAuthor,
    blurb,
    setBlurb,
    publisher,
    setPublisher,
    pubDate,
    setPubDate,
    isbn,
    setIsbn,
    language,
    setLanguage,
    genre,
    setGenre,
    resetMetadata,
    loadMetadata,
    currentBookId,
    setCurrentBookId,
    endnotes,
    setEndnotes,
    endnoteReferences,
    setEndnoteReferences,
    nextEndnoteNumber,
    setNextEndnoteNumber,
  } = useBookState();

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const isLoadingBookRef = useRef(false);

  const clearEditorStateFnRef = useRef<() => void>(() => {});
  const markCleanFnRef = useRef<() => void>(() => {});

  const [showMarketingPage, setShowMarketingPage] = useState(!user);

  const [showEPUBReader, setShowEPUBReader] = useState(false);
  const [epubBlob, setEpubBlob] = useState<Blob | null>(null);

  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileBookMindOpen, setMobileBookMindOpen] = useState(false);
  const [chaptersSheetOpen, setChaptersSheetOpen] = useState(false);
  const [mobileEditorFocused, setMobileEditorFocused] = useState(false);
  useKeyboardInset(mobileEditorFocused);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [newBookConfirmOpen, setNewBookConfirmOpen] = useState(false);
  const [chapterTypeDropdownOpen, setChapterTypeDropdownOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "confirm" | "alert" | "destructive";
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    variant: "alert",
    onConfirm: () => {},
  });

  const handleRefreshAnalytical = useCallback(
    async (kind: AnalyticalKind) => {
      if (!currentBookId || !user?.id) return;
      const book = loadBookById(user.id, currentBookId);
      if (!book) return;
      try {
        await ensureAnalyticalCache({
          userId: user.id,
          book: {
            ...book,
            bookmindMemory: {
              ...book.bookmindMemory,
              rules: book.bookmindMemory?.rules ?? [],
              characters: book.bookmindMemory?.characters ?? {},
              decisions: book.bookmindMemory?.decisions ?? [],
              analytical: {
                ...book.bookmindMemory?.analytical,
                [kind]: undefined,
              },
            },
          },
        });
      } catch (err) {
        console.warn("[book-mind] refresh analytical:", kind, err);
      }
    },
    [currentBookId, user?.id],
  );

  const [sidebarLibraryExpanded, setSidebarLibraryExpanded] = useState(true);
  const [sidebarChaptersExpanded, setSidebarChaptersExpanded] = useState(true);
  const [sidebarBookDetailsExpanded, setSidebarBookDetailsExpanded] =
    useState(false);

  const expandMobileSection = (section: "library" | "book" | "chapters") => {
    setSidebarLibraryExpanded(
      section === "library" ? !sidebarLibraryExpanded : false,
    );
    setSidebarBookDetailsExpanded(
      section === "book" ? !sidebarBookDetailsExpanded : false,
    );
    setSidebarChaptersExpanded(
      section === "chapters" ? !sidebarChaptersExpanded : false,
    );
  };

  useEffect(() => {
    if (!sidebarView) return;
    if (sidebarView === "library") setSidebarLibraryExpanded(true);
    if (sidebarView === "book") setSidebarBookDetailsExpanded(true);
    if (sidebarView === "chapters") setSidebarChaptersExpanded(true);
  }, [sidebarView]);

  const [saveFeedback, setSaveFeedback] = useState(false);
  const [bookJustLoaded, setBookJustLoaded] = useState(false);
  const [chapterJustAdded, setChapterJustAdded] = useState<string | null>(null);

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

  const {
    versions,
    saveVersion,
    deleteVersion,
    clearHistory,
    formatTimestamp,
    hasVersions,
  } = useVersionHistory({ bookId: currentBookId, userId: user?.id });

  const {
    exports: exportHistory,
    isLoading: exportHistoryLoading,
    saveExport,
    getExportBlob,
    deleteExport,
    clearHistory: clearExportHistory,
  } = useExportHistory({ bookId: currentBookId, maxExports: 5 });

  const [historyModal, setHistoryModal] = useState<
    "versions" | "exports" | null
  >(null);

  const cloudSync = useCloudSync({ user, isLoadingBookRef, setLibraryBooks });

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
    setDialogState,
  });

  const docImport = useDocumentImport({
    resetMetadata,
    setTitle,
    setAuthor,
    setChapters,
    setSelectedChapter,
    setTags,
    clearCover,
    setSidebarView,
  });

  const library = useLibrary({
    libraryBooks,
    setLibraryBooks,
    user,
    hasCloudSync,
    currentBookId,
    isLoadingBookRef,
    setShowMarketingPage,
    loadMetadata,
    setTags,
    setCoverUrl,
    setChapters,
    setEndnoteReferences,
    setEndnotes,
    setNextEndnoteNumber,
    setCurrentBookId,
    setSelectedChapter,
    setMobileSidebarOpen,
    setSidebarView,
    setBookJustLoaded,
    setDialogState,
    clearEditorState: () => clearEditorStateFnRef.current(),
  });

  const saveBook = useSaveBook({
    title,
    author,
    blurb,
    publisher,
    pubDate,
    isbn,
    language,
    genre,
    tags,
    chapters,
    setChapters,
    setEndnoteReferences,
    coverUrl,
    endnotes,
    endnoteReferences,
    currentBookId,
    setCurrentBookId,
    user,
    hasCloudSync,
    saveVersion,
    saveExport,
    exportHistory,
    getExportBlob,
    setDialogState,
    setLibraryBooks,
    setSaveFeedback,
    setSaveDialogOpen,
    newBookConfirmOpen,
    setNewBookConfirmOpen,
    setEpubBlob,
    setShowEPUBReader,
    closeExportHistoryModal: () => setHistoryModal(null),
    markClean: () => markCleanFnRef.current(),
    clearEditorState: () => clearEditorStateFnRef.current(),
  });

  const focus = useFocusMode();
  useTypewriterMode(focus.active && focus.settings.typewriterMode);
  useParagraphFocus(focus.active && focus.settings.paragraphFocus);

  useEffect(() => {
    if (focus.active && focus.settings.hideChrome) {
      setSidebarView(null);
      setSurfaceMode("edit");
    }
  }, [focus.active, focus.settings.hideChrome]);

  const handleAutoSave = useCallback(() => {
    const saved = saveBook.saveBookDirectly(false);

    if (currentBookId && user?.id && isPro) {
      const book = loadBookById(user.id, currentBookId);
      if (book) {
        ensureBookProfile({ userId: user.id, book })
          .then((result) => {
            if (
              result.ok &&
              (result.newCharacters?.length ?? 0) +
                (result.newLocations?.length ?? 0) >
                0
            ) {
              const parts: string[] = [];
              if (result.newCharacters?.length)
                parts.push(
                  `${result.newCharacters.length} character${result.newCharacters.length > 1 ? "s" : ""}`,
                );
              if (result.newLocations?.length)
                parts.push(
                  `${result.newLocations.length} location${result.newLocations.length > 1 ? "s" : ""}`,
                );
              toast(`Book Mind added ${parts.join(" and ")} to your profile`, {
                duration: 4000,
              });
            }
          })
          .catch(() => {});
      }
    }

    return saved;
  }, [
    currentBookId,
    title,
    author,
    blurb,
    publisher,
    pubDate,
    isbn,
    language,
    genre,
    tags,
    chapters,
    coverUrl,
    endnoteReferences,
    user?.id,
    isPro,
  ]);

  const hasContent =
    (title && title.trim() !== "") ||
    (author && author.trim() !== "") ||
    chapters.length > 0;

  const { isDirty, isSaving, lastSaved, markDirty, markClean } = useAutoSave({
    onSave: handleAutoSave,
    interval: 30000, // 30 seconds
    enabled: hasContent, // Enable auto-save as soon as user enters any data
  });

  markCleanFnRef.current = markClean;

  useUnsavedChangesWarning(isDirty);

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
      handleAddChapter("content", "");
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

  useEffect(() => {
    if (initialized && chapters.length > 0 && !isLoadingBookRef.current) {
      markDirty();
    }
  }, [
    chapters,
    title,
    author,
    blurb,
    publisher,
    pubDate,
    genre,
    tags,
    coverUrl,
  ]);

  const handleAutoFixTypography = useCallback(() => {
    const { fixedChapters, totalChanges } = autoFixAllChapters(chapters);
    if (totalChanges > 0) {
      setChapters(fixedChapters as Chapter[]);
      setDialogState({
        open: true,
        title: "Typography Fixed",
        message: `Fixed ${totalChanges} typography issue${totalChanges === 1 ? "" : "s"} across all chapters.`,
        variant: "alert",
        onConfirm: () => setDialogState((prev) => ({ ...prev, open: false })),
      });
    } else {
      setDialogState({
        open: true,
        title: "No Issues Found",
        message: "No typography issues found to fix.",
        variant: "alert",
        onConfirm: () => setDialogState((prev) => ({ ...prev, open: false })),
      });
    }
  }, [chapters, setChapters]);

  const handleToggleChapterLock = useCallback(
    (index: number) => {
      setChapters((prev) =>
        prev.map((ch, i) => (i === index ? { ...ch, locked: !ch.locked } : ch)),
      );
    },
    [setChapters],
  );

  const handleToggleChapterComplete = useCallback(
    (index: number) => {
      setChapters((prev) =>
        prev.map((ch, i) =>
          i === index ? { ...ch, completed: !ch.completed } : ch,
        ),
      );
      markDirty();
    },
    [setChapters, markDirty],
  );

  const handleBulkComplete = useCallback(
    (ids: Set<string>, completed: boolean) => {
      setChapters((prev) =>
        prev.map((ch) => (ids.has(ch.id) ? { ...ch, completed } : ch)),
      );
      markDirty();
    },
    [setChapters, markDirty],
  );

  const handleBulkDelete = useCallback(
    (ids: Set<string>, done: () => void) => {
      const remaining = chapters.filter((ch) => !ids.has(ch.id));
      if (remaining.length === 0) return;
      const count = ids.size;
      setDialogState({
        open: true,
        title: count === 1 ? "Delete chapter" : `Delete ${count} chapters`,
        message:
          count === 1
            ? "This chapter will be deleted. This cannot be undone."
            : `These ${count} chapters will be deleted. This cannot be undone.`,
        variant: "destructive",
        confirmLabel: "Delete",
        onConfirm: () => {
          setDialogState((prev) => ({ ...prev, open: false }));
          const currentId = chapters[selectedChapter]?.id;
          const index = remaining.findIndex((ch) => ch.id === currentId);
          setChapters(remaining);
          setSelectedChapter(index >= 0 ? index : 0);
          setEndnoteReferences((prev) =>
            prev.filter((ref) => !ids.has(ref.chapterId)),
          );
          markDirty();
          done();
        },
      });
    },
    [chapters, selectedChapter, setChapters, setSelectedChapter, markDirty],
  );

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
          setChapters(restoredChapters);
          if (metadata.blurb) setBlurb(metadata.blurb);
          if (metadata.publisher) setPublisher(metadata.publisher);
          if (metadata.pubDate) setPubDate(metadata.pubDate);
          if (metadata.genre) setGenre(metadata.genre);
          if (metadata.tags) setTags(metadata.tags);
          setSelectedChapter(0);
          setHistoryModal(null);
          markDirty();
        },
      });
    },
    [
      setChapters,
      setBlurb,
      setPublisher,
      setPubDate,
      setGenre,
      setTags,
      setSelectedChapter,
      markDirty,
    ],
  );

  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [markerStyle, setMarkerStyle] = useState({ top: 0, height: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = chapterRefs.current[selectedChapter];
    if (el) {
      setMarkerStyle({
        top: el.offsetTop,
        height: el.offsetHeight,
      });
    }
  }, [selectedChapter, chapters.length]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setChapterTypeDropdownOpen(false);
      }
    }
    if (chapterTypeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [chapterTypeDropdownOpen]);

  function showNewBookConfirmation() {
    setNewBookConfirmOpen(true);
  }

  function clearEditorState() {
    resetMetadata();
    setTags([]);
    clearCover();
    setChapters([
      {
        id: uuidv4(),
        title: "",
        content: "",
        type: "content",
      },
    ]);
    setSelectedChapter(0);
    setSidebarView(null);

    if (!onboarding.isOnboardingComplete) {
      setTimeout(() => onboarding.startTour(), 800);
    }
  }

  clearEditorStateFnRef.current = clearEditorState;

  function handleNewBookConfirm() {
    if (title || author || chapters.some((ch) => ch.content.trim())) {
      saveForNewBook();
    } else {
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  function saveForNewBook() {
    if (currentBookId) {
      const library = loadBookLibrary(user?.id ?? "");
      const existingBook = library.find((b: any) => b.id === currentBookId);
      if (existingBook) {
        setSaveDialogOpen(true);
        return;
      }
    }

    saveBook.saveBookDirectly(false);
    saveBook.saveVersionSnapshot();
    clearEditorState();
    setNewBookConfirmOpen(false);
  }

  function handleStartWriting() {
    setShowMarketingPage(false);
    if (libraryBooks.length > 0) {
      const mostRecent = libraryBooks.reduce((a, b) =>
        a.savedAt > b.savedAt ? a : b,
      );
      library.handleLoadBook(mostRecent.id);
    } else {
      clearEditorState();
    }
  }

  function handleGoToHome() {
    setChapters([]);
    setTitle("");
    setAuthor("");
    setCurrentBookId(undefined);
    setSelectedChapter(0);
    setSidebarView(null);
  }

  useEffect(() => {
    if (!initialized || !user || libraryLoading) return;
    if (showMarketingPage || chapters.length > 0) return;
    if (libraryBooks.length > 0) {
      const latest = libraryBooks.reduce((a, b) =>
        a.savedAt > b.savedAt ? a : b,
      );
      library.handleLoadBook(latest.id);
    } else {
      clearEditorState();
    }
  }, [initialized, user, libraryLoading, showMarketingPage, chapters.length]);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setLibraryLoading(false);
      return;
    }

    const books = loadBookLibrary(user.id);
    setLibraryBooks(books);
    setLibraryLoading(false);

    const loadBookId = searchParams ? searchParams.get("load") : null;
    if (loadBookId) {
      const bookToLoad = books.find((book) => book.id === loadBookId);
      if (bookToLoad) {
        setShowMarketingPage(false);
        library.handleLoadBook(loadBookId);
        router.replace("/make-ebook", { scroll: false });
        setInitialized(true);
        return;
      } else {
        router.replace("/make-ebook", { scroll: false });
        if (!initialized) setInitialized(true);
        return;
      }
    }

    if (!initialized) setInitialized(true);
  }, [
    authLoading,
    user?.id,
    searchParams,
    initialized,
    currentBookId,
    chapters.length,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          scrollContainerRef.current;
        const hasMoreContent = scrollTop + clientHeight < scrollHeight - 10;
        setShowScrollIndicator(hasMoreContent);
      }
    };

    const container = scrollContainerRef.current;
    if (container && mobileSidebarOpen) {
      handleScroll();

      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [mobileSidebarOpen, tab]);

  const isBlankBook =
    chapters.length === 1 &&
    !chapters[0].content.replace(/<[^>]+>/g, "").trim() &&
    !title?.trim();

  if (showMarketingPage && chapters.length === 0) {
    return (
      <MarketingLandingPage
        onStartWritingAction={handleStartWriting}
        libraryCount={libraryBooks.length}
      />
    );
  }

  return (
    <>
      <TrialBanner />

      <div className="bg-white dark:bg-[var(--ink)] text-[var(--ink)] dark:text-[var(--paper)]">
        {newBookConfirmOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[var(--ink)] rounded shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--paper)] mb-4">
                Start New Book?
              </h2>
              <p className="text-gray-600 dark:text-[var(--clay)] mb-6">
                This will save your current book and start a new one. All your
                current work will be preserved in the library.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setNewBookConfirmOpen(false)}
                  className="flex-1 px-4 py-2 rounded border border-[var(--clay)] dark:border-[var(--ink-hover)] text-sm font-medium text-gray-900 dark:text-[var(--paper)] hover:bg-[var(--paper)] dark:hover:bg-[var(--ink-raised)] transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleNewBookConfirm}
                  className="flex-1 px-4 py-2 rounded bg-[var(--ink-raised)] dark:bg-[var(--ink-raised)] text-white text-sm font-medium hover:bg-[var(--ink-raised)] dark:hover:bg-[var(--ink-hover)] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {saveDialogOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[var(--ink)] rounded shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--paper)] mb-4">
                Save Book
              </h2>
              <p className="text-gray-600 dark:text-[var(--clay)] mb-6">
                This book already exists in your library. Do you want to
                overwrite the existing version or save as a new version?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSaveDialogOpen(false)}
                  className="flex-1 px-4 py-2 rounded border border-[var(--clay)] dark:border-[var(--ink-hover)] text-sm font-medium text-gray-900 dark:text-[var(--paper)] hover:bg-[var(--paper)] dark:hover:bg-[var(--ink-raised)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBook.handleOverwriteBook}
                  className="flex-1 px-4 py-2 rounded bg-gray-900 dark:bg-white text-white dark:text-[var(--ink-deep)] text-sm font-medium hover:bg-gray-800 dark:hover:bg-[var(--ink-raised)] transition-colors"
                >
                  Overwrite
                </button>
                <button
                  onClick={saveBook.handleSaveAsNewVersion}
                  className="flex-1 px-4 py-2 rounded bg-[var(--ink-raised)] dark:bg-[var(--ink-raised)] text-white text-sm font-medium hover:bg-[var(--ink-raised)] dark:hover:bg-[var(--ink-hover)] transition-colors"
                >
                  Save as New
                </button>
              </div>
            </div>
          </div>
        )}

        {docImport.importDialogOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[var(--ink)] rounded-xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--paper)]">
                  Import Document
                </h2>
                <button
                  onClick={() => docImport.setImportDialogOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] rounded transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-[var(--clay-muted)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.6}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 dark:text-[var(--clay)] mb-4">
                Upload a document to automatically parse chapters and create a
                new book.
              </p>

              <div className="mb-4 p-4 border-2 border-dashed border-gray-300 dark:border-[var(--ink-hover)] rounded-lg text-center">
                <input
                  ref={docImport.importFileInputRef}
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={docImport.handleImportFileSelect}
                  className="hidden"
                />

                <div className="mb-3">
                  <svg
                    className="w-10 h-10 mx-auto text-gray-400 dark:text-[var(--clay-muted)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.6}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <button
                  onClick={() => docImport.importFileInputRef.current?.click()}
                  disabled={docImport.importing}
                  className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {docImport.importing ? "Importing..." : "Choose File"}
                </button>

                <p className="text-xs text-gray-500 dark:text-[var(--clay-muted)] mt-2">
                  Supported: .txt, .doc, .docx, .pdf
                </p>
              </div>

              {docImport.importError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {docImport.importError}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-[var(--clay-muted)] space-y-1">
                <p>
                  • Chapters are detected by headings like "Chapter 1",
                  "Prologue", etc.
                </p>
                <p>• The document title will be extracted if possible</p>
                <p>• You can edit all details after import</p>
              </div>
            </div>
          </div>
        )}

        {historyModal && (
          <HistoryPanel
            initialTab={historyModal}
            onClose={() => setHistoryModal(null)}
            versions={versions}
            currentWordCount={bookStats.totalWords}
            onRestoreVersion={handleRestoreVersion}
            onDeleteVersion={deleteVersion}
            onClearAllVersions={clearHistory}
            exports={exportHistory}
            exportsLoading={exportHistoryLoading}
            onPreviewExport={saveBook.handlePreviewExport}
            onDownloadExport={saveBook.handleDownloadExport}
            onDeleteExport={deleteExport}
            onClearAllExports={clearExportHistory}
          />
        )}

        {mobileBookMindOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col animate-slide-in-from-bottom bg-white dark:bg-[var(--ink-panel)]">
            <div className="flex items-center justify-end px-3 py-2 border-b border-gray-200 dark:border-[var(--rule)] flex-shrink-0">
              <button
                onClick={() => setMobileBookMindOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--clay-muted)] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] transition-colors"
                aria-label="Close Book Mind"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <InspectorPanel
                bookId={currentBookId}
                userId={user?.id}
                title={title}
                author={author}
                genre={genre}
                chapters={chapters}
                selectedChapterIndex={selectedChapter}
                selectedText={selectedEditorText}
                coverFile={coverUrl}
                onNavigateToChapter={(idx) => {
                  setSelectedChapter(idx);
                  setMobileBookMindOpen(false);
                }}
                onRefreshAnalytical={handleRefreshAnalytical}
                onAddDisclosureChapter={(content: string) => {
                  const newChapter = {
                    id: uuidv4(),
                    title: "AI Disclosure",
                    content,
                    type: "backmatter" as const,
                  };
                  setChapters((prev) => [...prev, newChapter]);
                  setSelectedChapter(chapters.length);
                  toast.success("AI Disclosure chapter added");
                }}
                onExport={() => setPreflightFormat("epub")}
                isPro={isPro}
                onUpgrade={() => setExportUpgradeOpen(true)}
              />
            </div>
          </div>
        )}

        <div
          className={`fixed top-0 left-0 right-0 bottom-0 z-[100] lg:hidden transition-[visibility] duration-200 ease-out ${
            mobileSidebarOpen ? "visible" : "invisible"
          }`}
        >
          <div
            className={`absolute inset-0 bg-black/55 transition-opacity duration-200 ease-out ${
              mobileSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div
            className={`${studio.drawer} transform transition-transform duration-200 ease-out ${
              mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full">
              <div className={studio.drawerHead}>
                <button
                  type="button"
                  onClick={() => {
                    handleGoToHome();
                    setMobileSidebarOpen(false);
                  }}
                  className={studio.drawerBrand}
                  aria-label="Go to home"
                >
                  <Image
                    src="/make-ebook/brand/mark.svg"
                    alt=""
                    width={38}
                    height={14}
                    className="h-[13px] w-auto"
                    priority
                  />
                  <span>makeebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={studio.mobileIconBtn}
                  aria-label="Close menu"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="3" />
                    <path d="M9 4v16" />
                  </svg>
                </button>
              </div>

              <div className={studio.drawerBody}>
                <DrawerSection
                  icon={
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 4v16M10 7v13M16 5v15M3 20h18" />
                    </svg>
                  }
                  label="Library"
                  count={libraryBooks.length}
                  alert={cloudSync.syncConflicts.length > 0}
                  open={sidebarLibraryExpanded}
                  onToggle={() => expandMobileSection("library")}
                >
                  <SyncConflictBanner
                    conflicts={cloudSync.syncConflicts}
                    onResolve={cloudSync.handleResolveSyncConflict}
                  />
                  <LibraryPanel
                    libraryBooks={libraryBooks}
                    selectedBookId={selectedBookId}
                    currentBookId={currentBookId}
                    setSelectedBookId={setSelectedBookId}
                    handleLoadBook={(id) => {
                      library.handleLoadBook(id);
                      setMobileSidebarOpen(false);
                    }}
                    handleDeleteBook={library.handleDeleteBook}
                    showNewBookConfirmation={() => {
                      showNewBookConfirmation();
                      setMobileSidebarOpen(false);
                    }}
                    showImportDialog={() => {
                      docImport.showImportDialog();
                      setMobileSidebarOpen(false);
                    }}
                    multiSelectMode={library.multiSelectMode}
                    setMultiSelectMode={library.setMultiSelectMode}
                    selectedBookIds={library.selectedBookIds}
                    toggleBookSelection={library.toggleBookSelection}
                    toggleSelectAll={library.toggleSelectAll}
                    handleDeleteSelectedBooks={
                      library.handleDeleteSelectedBooks
                    }
                    compact
                  />
                </DrawerSection>

                <DrawerSection
                  icon={
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h11M9 8h6" />
                    </svg>
                  }
                  label="Book details"
                  open={sidebarBookDetailsExpanded}
                  onToggle={() => expandMobileSection("book")}
                >
                  <BookDetailsPanel
                    title={title}
                    setTitle={setTitle}
                    author={author}
                    setAuthor={setAuthor}
                    blurb={blurb}
                    setBlurb={setBlurb}
                    publisher={publisher}
                    setPublisher={setPublisher}
                    pubDate={pubDate}
                    setPubDate={setPubDate}
                    isbn={isbn}
                    setIsbn={setIsbn}
                    language={language}
                    setLanguage={setLanguage}
                    genre={genre}
                    setGenre={setGenre}
                    tags={tags}
                    handleAddTag={handleAddTag}
                    handleRemoveTag={handleRemoveTag}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    coverFile={coverUrl}
                    handleCoverChange={handleCoverChange}
                    setCoverFile={setCoverUrl}
                    lockedSections={lockedSections}
                    compact
                    idPrefix="mbd"
                  />
                </DrawerSection>

                <DrawerSection
                  icon={
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
                    </svg>
                  }
                  label="Chapters"
                  count={chapters.length}
                  open={sidebarChaptersExpanded}
                  onToggle={() => expandMobileSection("chapters")}
                >
                  <ChaptersPanel
                    chapters={chapters}
                    selectedChapter={selectedChapter}
                    handleSelectChapter={(i) => {
                      handleSelectChapter(i);
                      setMobileSidebarOpen(false);
                    }}
                    handleAddChapter={handleAddChapter}
                    handleRemoveChapter={handleRemoveChapter}
                    confirmChapterDelete={confirmChapterDelete}
                    handleToggleChapterLock={handleToggleChapterLock}
                    handleToggleChapterComplete={handleToggleChapterComplete}
                    handleDragStart={handleDragStart}
                    handleDragEnter={handleDragEnter}
                    handleDragEnd={handleDragEnd}
                    handleTouchStart={handleTouchStart}
                    handleTouchMove={handleTouchMove}
                    handleTouchEnd={handleTouchEnd}
                    dragOverIndex={dragOverIndex}
                    dragItemIndex={dragItemIndex}
                    ghostPillPosition={ghostPillPosition}
                    getContentChapterNumber={getContentChapterNumber}
                    chapterWordCounts={bookStats.chapterStats.map(
                      (c) => c.wordCount,
                    )}
                    onBulkComplete={handleBulkComplete}
                    onBulkDelete={handleBulkDelete}
                    compact
                  />
                </DrawerSection>
              </div>

              <footer className={studio.drawerFoot}>
                <UserDropdownMobile
                  onStartTour={() => {
                    setMobileSidebarOpen(false);
                    onboarding.resetOnboarding();
                    if (chapters.length === 0) clearEditorState();
                    setTimeout(
                      () => onboarding.startTour(),
                      chapters.length === 0 ? 800 : 400,
                    );
                  }}
                />
              </footer>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[100dvh] overflow-hidden">
          {!(focus.active && focus.settings.hideChrome) && (
            <EditorLeftNav
              isPanelOpen={isPanelOpen}
              activeView={sidebarView}
              onViewChange={setSidebarView}
              onClose={() => setSidebarView(null)}
              onLogoClick={handleGoToHome}
              onStartTour={() => {
                onboarding.resetOnboarding();
                if (chapters.length === 0) {
                  clearEditorState();
                }

                setTimeout(
                  () => onboarding.startTour(),
                  chapters.length === 0 ? 800 : 100,
                );
              }}
              onBookMindToggle={() => setBookMindOpen((prev) => !prev)}
              isBookMindOpen={bookMindOpen}
              libraryBooks={libraryBooks}
              currentBookId={currentBookId}
              selectedBookId={selectedBookId}
              setSelectedBookId={setSelectedBookId}
              handleLoadBook={library.handleLoadBook}
              handleDeleteBook={library.handleDeleteBook}
              showNewBookConfirmation={showNewBookConfirmation}
              showImportDialog={docImport.showImportDialog}
              multiSelectMode={library.multiSelectMode}
              setMultiSelectMode={library.setMultiSelectMode}
              selectedBookIds={library.selectedBookIds}
              toggleBookSelection={library.toggleBookSelection}
              toggleSelectAll={library.toggleSelectAll}
              handleDeleteSelectedBooks={library.handleDeleteSelectedBooks}
              syncConflicts={cloudSync.syncConflicts}
              onResolveSyncConflict={cloudSync.handleResolveSyncConflict}
              chapters={chapters}
              selectedChapter={selectedChapter}
              handleSelectChapter={handleSelectChapter}
              handleAddChapter={handleAddChapter}
              handleRemoveChapter={handleRemoveChapter}
              confirmChapterDelete={confirmChapterDelete}
              handleToggleChapterLock={handleToggleChapterLock}
              handleToggleChapterComplete={handleToggleChapterComplete}
              handleDragStart={handleDragStart}
              handleDragEnter={handleDragEnter}
              handleDragEnd={handleDragEnd}
              handleTouchStart={handleTouchStart}
              handleTouchMove={handleTouchMove}
              handleTouchEnd={handleTouchEnd}
              dragOverIndex={dragOverIndex}
              dragItemIndex={dragItemIndex}
              ghostPillPosition={ghostPillPosition}
              getContentChapterNumber={getContentChapterNumber}
              onBulkComplete={handleBulkComplete}
              onBulkDelete={handleBulkDelete}
              chapterWordCounts={bookStats.chapterStats.map((c) => c.wordCount)}
              totalWords={bookStats.totalWords}
              title={title}
              setTitle={setTitle}
              author={author}
              setAuthor={setAuthor}
              blurb={blurb}
              setBlurb={setBlurb}
              publisher={publisher}
              setPublisher={setPublisher}
              pubDate={pubDate}
              setPubDate={setPubDate}
              isbn={isbn}
              setIsbn={setIsbn}
              language={language}
              setLanguage={setLanguage}
              genre={genre}
              setGenre={setGenre}
              tags={tags}
              handleAddTag={handleAddTag}
              handleRemoveTag={handleRemoveTag}
              tagInput={tagInput}
              setTagInput={setTagInput}
              coverFile={coverUrl}
              handleCoverChange={handleCoverChange}
              setCoverFile={setCoverUrl}
              lockedSections={lockedSections}
              sidebarLibraryExpanded={sidebarLibraryExpanded}
              setSidebarLibraryExpanded={setSidebarLibraryExpanded}
              sidebarChaptersExpanded={sidebarChaptersExpanded}
              setSidebarChaptersExpanded={setSidebarChaptersExpanded}
              sidebarBookDetailsExpanded={sidebarBookDetailsExpanded}
              setSidebarBookDetailsExpanded={setSidebarBookDetailsExpanded}
            />
          )}

          <main
            data-editor-scroll
            className={`flex-1 flex flex-col bg-white dark:bg-[var(--ink)] px-0 py-0 ${chapters.length > 0 ? "lg:pl-0" : "lg:pl-0"} lg:pr-0 lg:py-0 min-w-0 overflow-x-hidden overflow-y-auto relative`}
          >
            {chapters.length > 0 && (
              <div
                className={`lg:hidden ${studio.mobileBar}`}
                data-mobile-topbar
              >
                <button
                  type="button"
                  data-tour="mobile-menu"
                  onClick={() => setMobileSidebarOpen(true)}
                  className={studio.mobileIconBtn}
                  aria-label="Open menu"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="3" />
                    <path d="M9 4v16" />
                  </svg>
                </button>

                <div className={studio.mobileTitle}>
                  <span className={studio.mobileTitleText}>
                    {title?.trim() || "Untitled book"}
                  </span>
                  <button
                    type="button"
                    className={studio.mobileStatus}
                    onClick={() => {
                      if (isDirty && !isSaving) {
                        void saveBook.saveBookDirectly(false);
                      }
                    }}
                    aria-label={
                      isSaving
                        ? "Saving"
                        : isDirty
                          ? "Unsaved changes, tap to save"
                          : "Saved on this device"
                    }
                  >
                    <span
                      className={`${studio.savedDot} ${
                        isSaving
                          ? studio.savingDot
                          : isDirty
                            ? studio.dirtyDot
                            : ""
                      }`}
                    />
                    {isSaving ? "Saving" : isDirty ? "Unsaved" : "Saved"}
                  </button>
                </div>

                <button
                  type="button"
                  className={studio.mobileExport}
                  onClick={() => setPreflightFormat("epub")}
                >
                  Export
                </button>
              </div>
            )}

            <div className="hidden lg:block"></div>

            <div
              data-tour="mobile-editor"
              data-mobile-editor
              className={`lg:hidden flex flex-col ${chapters.length === 0 ? "" : "pt-[52px] pb-[92px]"} flex-1 min-h-0 overflow-hidden`}
            >
              {chapters.length === 0 ? (
                <div className="flex-1" />
              ) : surfaceMode === "preview" ? (
                <PreviewSurface
                  chapters={chapters}
                  selectedChapter={selectedChapter}
                />
              ) : (
                <>
                  <ChapterPanel
                    chapter={chapters[selectedChapter]}
                    selectedChapter={selectedChapter}
                    onTitleChange={handleChapterTitleChange}
                    onContentChange={handleChapterContentChange}
                    onCreateEndnote={endnotesHook.handleCreateEndnote}
                    hasEndnotes={endnotes.length > 0}
                    hideToolbar={focus.active && focus.settings.hideToolbar}
                    onFocusStateChange={setMobileEditorFocused}
                    starters={
                      isBlankBook
                        ? {
                            onUpload: docImport.showImportDialog,
                            onLibrary: () => setMobileSidebarOpen(true),
                          }
                        : undefined
                    }
                  />
                </>
              )}
            </div>

            <div className="hidden lg:flex flex-col flex-1 min-h-0 overflow-hidden">
              {chapters.length === 0 ? (
                <div className="flex-1" />
              ) : (
                <section className="flex flex-col min-w-0 flex-1 min-h-0 pt-2 bg-white dark:bg-[var(--ink)]">
                  <EditorHeader
                    isDirty={isDirty}
                    isSaving={isSaving}
                    lastSaved={lastSaved}
                    hasCloudSync={hasCloudSync}
                    onSaveNow={() => {
                      void saveBook.saveBookDirectly(false);
                    }}
                    chapters={chapters}
                    selectedChapter={selectedChapter}
                    onChapterSelect={setSelectedChapter}
                    bookTitle={title}
                    onSaveAsNewBook={saveBook.handleSaveAsNewVersion}
                    versionCount={versions.length}
                    exportCount={exportHistory.length}
                    onShowHistory={() => setHistoryModal("versions")}
                    focusActive={focus.active}
                    onToggleFocusMode={focus.toggleFocusMode}
                    flowMode={flowMode}
                    onToggleFlowMode={handleToggleFlowMode}
                    surfaceMode={surfaceMode}
                    onSurfaceModeChange={setSurfaceMode}
                    onExportEPUB={() => setPreflightFormat("epub")}
                    onExportPDF={() => setPreflightFormat("pdf")}
                    onExportDocx={() => setPreflightFormat("docx")}
                    hideChrome={focus.active && focus.settings.hideChrome}
                  />
                  <EditorCanvas
                    mode={surfaceMode}
                    starters={
                      isBlankBook
                        ? {
                            onUpload: docImport.showImportDialog,
                            onLibrary: () => setSidebarView("library"),
                          }
                        : undefined
                    }
                    chapters={chapters}
                    selectedChapter={selectedChapter}
                    onChapterTitleChange={handleChapterTitleChange}
                    onChapterContentChange={handleChapterContentChange}
                    onChapterSelect={handleSelectChapter}
                    onCreateEndnote={endnotesHook.handleCreateEndnote}
                    endnotesCount={endnotes.length}
                    bookStats={bookStats}
                    sessionStats={sessionStats}
                    todayWords={writingGoals.todayWords}
                    focus={{ active: focus.active, settings: focus.settings }}
                    onInlineEditRequest={
                      hasBookMind ? handleInlineEditRequest : undefined
                    }
                    onComposeRequest={
                      hasBookMind ? handleComposeRequest : undefined
                    }
                    isBookMindLoading={false}
                    onOpenBookMind={
                      hasBookMind ? () => setBookMindOpen(true) : undefined
                    }
                  />
                </section>
              )}
            </div>
          </main>
        </div>
      </div>

      {chapters.length > 0 && (
        <>
          <div className="lg:hidden">
            <ChaptersSheet
              open={chaptersSheetOpen}
              onClose={() => setChaptersSheetOpen(false)}
              chapters={chapters}
              selectedChapter={selectedChapter}
              wordCounts={bookStats.chapterStats.map((c) => c.wordCount)}
              totalWords={bookStats.totalWords}
              onSelectChapter={handleSelectChapter}
              onToggleComplete={handleToggleChapterComplete}
              onAddChapter={() => {
                handleAddChapter("content");
                setChaptersSheetOpen(false);
              }}
              onBulkComplete={handleBulkComplete}
              onBulkDelete={handleBulkDelete}
            />
          </div>

          {hasBookMind && !mobileBookMindOpen && (
            <div className="lg:hidden">
              <SelectionActionBar
                onRewrite={(selectedText, range, rect) =>
                  handleInlineEditRequest({
                    selectedText,
                    range,
                    rect,
                    instruction: "Rewrite this passage.",
                  })
                }
                onTighten={(selectedText, range, rect) =>
                  handleInlineEditRequest({
                    selectedText,
                    range,
                    rect,
                    instruction:
                      "Tighten this passage. Same meaning, fewer words.",
                  })
                }
                onAsk={(selectedText, range, rect) =>
                  handleInlineEditRequest({ selectedText, range, rect })
                }
              />
            </div>
          )}

          {!mobileEditorFocused && (
            <div className="lg:hidden">
              <MobileTabBar
                active={
                  chaptersSheetOpen
                    ? "chapters"
                    : mobileBookMindOpen
                      ? "bookmind"
                      : surfaceMode === "preview"
                        ? "preview"
                        : "write"
                }
                hasBookMind={hasBookMind}
                onWrite={() => {
                  setChaptersSheetOpen(false);
                  setMobileBookMindOpen(false);
                  setSurfaceMode("edit");
                }}
                onPreview={() => {
                  setChaptersSheetOpen(false);
                  setMobileBookMindOpen(false);
                  setSurfaceMode("preview");
                }}
                onChapters={() => {
                  setMobileBookMindOpen(false);
                  setChaptersSheetOpen((prev) => !prev);
                }}
                onBookMind={() => {
                  setChaptersSheetOpen(false);
                  setMobileBookMindOpen(true);
                }}
              />
            </div>
          )}
        </>
      )}

      {hasBookMind && bookMindOpen && (
        <FloatingBookMindWindow
          isOpen={bookMindOpen}
          onClose={() => setBookMindOpen(false)}
          chapters={chapters}
          selectedChapter={selectedChapter}
          onChapterSelect={setSelectedChapter}
          bookId={currentBookId}
          userId={user?.id}
          title={title}
          author={author}
          genre={genre}
          selectedText={selectedEditorText}
          coverFile={coverUrl}
          onRefreshAnalytical={handleRefreshAnalytical}
          onAddDisclosureChapter={(content: string) => {
            const newChapter = {
              id: uuidv4(),
              title: "AI Disclosure",
              content,
              type: "backmatter" as const,
            };
            setChapters((prev) => [...prev, newChapter]);
            setSelectedChapter(chapters.length);
            toast.success("AI Disclosure chapter added");
          }}
          onExport={() => setPreflightFormat("epub")}
          isPro={isPro}
          onUpgrade={() => setExportUpgradeOpen(true)}
        />
      )}

      {hasBookMind && (
        <>
          <InlineEditPopover
            request={inlineEditRequest}
            onClose={handleInlineEditClose}
            onAccept={handleInlineEditAccept}
            bookId={currentBookId}
            userId={user?.id}
          />
          <ComposePalette
            request={composeRequest}
            onClose={handleComposeClose}
            onInsert={handleComposeInsert}
            bookId={currentBookId}
            userId={user?.id}
          />

          <GhostTextOverlay
            enabled={flowMode && chapters.length > 0}
            bookId={currentBookId}
            userId={user?.id}
            onAccept={handleGhostAccept}
          />

          {cmdkHintRect &&
            !inlineEditRequest.open &&
            typeof navigator !== "undefined" &&
            !/Mobi|Android|iPad|iPhone/i.test(navigator.userAgent) && (
              <div
                style={{
                  position: "fixed",
                  top: cmdkHintRect.top,
                  left: cmdkHintRect.left,
                  zIndex: 900,
                  pointerEvents: "none",
                }}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-900/90 dark:bg-[color:color-mix(in_srgb,var(--rule)_95%,transparent)] text-white text-[11px] font-medium shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-1 duration-200"
              >
                <svg
                  className="w-3 h-3 opacity-70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>
                  {typeof navigator !== "undefined" &&
                  /Mac/i.test(navigator.platform)
                    ? "⌘"
                    : "Ctrl+"}
                  K for AI writer
                </span>
              </div>
            )}
        </>
      )}

      <EPUBReaderModal
        isOpen={showEPUBReader}
        onClose={() => setShowEPUBReader(false)}
        epubBlob={epubBlob}
        bookTitle={title}
      />

      <ConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        message={dialogState.message}
        variant={dialogState.variant}
        confirmLabel={dialogState.confirmLabel}
        onConfirm={dialogState.onConfirm}
        onCancel={() => setDialogState((prev) => ({ ...prev, open: false }))}
      />

      <OnboardingTour
        isTourActive={onboarding.isTourActive}
        currentStep={onboarding.currentStep}
        totalSteps={onboarding.totalSteps}
        stepData={onboarding.currentStepData}
        onNext={onboarding.nextStep}
        onPrev={onboarding.prevStep}
        onSkip={onboarding.skipTour}
      />

      {focus.active && (
        <FocusModePanel
          settings={focus.settings}
          onChangeSetting={focus.setSetting}
          onExit={focus.exitFocusMode}
        />
      )}

      <AmbientPlayer
        sound={focus.settings.ambientSound}
        volume={focus.settings.ambientVolume}
        active={focus.active && focus.settings.ambientSound !== "none"}
      />

      <FindReplacePanel
        isOpen={findReplace.isOpen}
        onClose={findReplace.close}
        searchTerm={findReplace.searchTerm}
        onSearchChange={findReplace.setSearchTerm}
        replaceTerm={findReplace.replaceTerm}
        onReplaceChange={findReplace.setReplaceTerm}
        caseSensitive={findReplace.caseSensitive}
        onCaseSensitiveChange={findReplace.setCaseSensitive}
        matches={findReplace.matches}
        totalMatches={findReplace.totalMatches}
        onReplaceInChapter={findReplace.replaceInChapter}
        onReplaceAll={findReplace.replaceAll}
        onGoToMatch={findReplace.goToMatch}
      />

      <PreflightExportDialog
        open={preflightFormat !== null}
        format={preflightFormat ?? "epub"}
        input={{
          title,
          author,
          chapters,
          coverFile: coverUrl,
          language,
          genre,
        }}
        isPro={isPro}
        fixes={{
          setTitle,
          setAuthor,
          setGenre,
          setLanguage,
          onCoverChange: handleCoverChange,
          setCover: setCoverUrl,
          onShowField: (field) => {
            const mobile = window.innerWidth < 1024;
            if (mobile) {
              setSidebarLibraryExpanded(false);
              setSidebarChaptersExpanded(false);
              setSidebarBookDetailsExpanded(true);
              setMobileSidebarOpen(true);
            } else {
              setSidebarView("book");
            }
            window.setTimeout(() => {
              const el = document.getElementById(
                `${mobile ? "mbd" : "bd"}-${field}`,
              );
              if (!el) return;
              const target =
                field === "cover-image"
                  ? ((el.previousElementSibling as HTMLElement | null) ?? el)
                  : el;
              target.scrollIntoView({ block: "center", behavior: "smooth" });
              if (field !== "cover-image") el.focus({ preventScroll: true });
              target.animate(
                [
                  { boxShadow: "0 0 0 2px var(--acid)" },
                  { boxShadow: "0 0 0 2px transparent" },
                ],
                { duration: 1800, easing: "ease-out" },
              );
            }, 450);
          },
          onShowChapters: () => {
            if (window.innerWidth < 1024) setChaptersSheetOpen(true);
            else setSidebarView("chapters");
          },
        }}
        onClose={() => setPreflightFormat(null)}
        onDownload={() => {
          if (preflightFormat === "epub") saveBook.handleExportEPUB();
          else if (preflightFormat === "pdf") saveBook.handleExportPDF();
          else if (preflightFormat === "docx") saveBook.handleExportDocx();
        }}
        onUpgrade={() => setExportUpgradeOpen(true)}
      />

      <UpgradeModal
        isOpen={exportUpgradeOpen}
        onClose={() => setExportUpgradeOpen(false)}
        feature="Amazon KDP pre-flight"
      />
    </>
  );
}

export default function MakeEbookPageWrapper() {
  return (
    <Suspense fallback={<BrandLoader />}>
      <MakeEbookPage />
    </Suspense>
  );
}
