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
import { BookToolbar } from "@/components/BookToolbar";
import { useSearchParams, useRouter } from "next/navigation";
import {
  PlusIcon,
  TrashIcon,
  CloseIcon,
  SaveIcon,
  DownloadIcon,
  BookIcon,
  LockIcon,
  MetadataIcon,
  MenuIcon,
} from "./components/icons";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import EmptyEditorState from "./components/EmptyEditorState";
import MarketingLandingPage from "./components/MarketingLandingPage";
import BinIcon from "./components/icons/BinIcon";
import { LANGUAGES, today } from "./utils/constants";
import { CHAPTER_TEMPLATES, Chapter, Endnote, EndnoteReference } from "./types";
import { useChapters } from "./hooks/useChapters";
import { useTags } from "./hooks/useTags";
import { useCover } from "./hooks/useCover";
import { useLockedSections } from "./hooks/useLockedSections";
import { useAutoSave, useUnsavedChangesWarning } from "./hooks/useAutoSave";
import { useEditorShortcuts } from "./hooks/useKeyboardShortcuts";
import { useBookState } from "./hooks/useBookState";
import { autoFixAllChapters } from "./utils/typographyFixer";
import RichTextEditor from "./components/RichTextEditor";
import EditorLeftNav from "./components/EditorLeftNav";
import CollapsibleSection from "./components/CollapsibleSection";
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
import EditorRightPanel from "./components/EditorRightPanel";
import EditorCanvas from "./components/EditorCanvas";
import type { RightPanelMode } from "./components/LayoutSwitcher";
import EditorHeader from "./components/EditorHeader";
import TrialBanner from "./components/TrialBanner";
import ChapterNavDropdown from "./components/ChapterNavDropdown";
import { useWordStats } from "./hooks/useWordStats";
import { uuidv4 } from "./utils/uuid";
import { useWritingGoals } from "./hooks/useWritingGoals";
import { useVersionHistory } from "./hooks/useVersionHistory";
import { useExportHistory } from "./hooks/useExportHistory";
import HistoryPanel from "./components/HistoryPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import EPUBReaderModal from "./components/EPUBReaderModal";
import ConfirmDialog from "./components/ConfirmDialog";
import FindReplacePanel from "./components/FindReplacePanel";
import { useFindReplace } from "./hooks/useFindReplace";
import { useOnboarding } from "./hooks/useOnboarding";
import OnboardingTour from "./components/OnboardingTour";
import {
  loadBookLibrary,
  saveBookToLibrary,
  loadBookById,
} from "./utils/bookLibrary";

import { ensureAnalyticalCache } from "./utils/analyticalCache";
import type { AnalyticalKind } from "./utils/bookmindMemory";
import { ensureBookProfile } from "./utils/bookmindProfile";

import { getContentChapterNumber } from "./utils/pageUtils";
import { ChapterCapsuleMarker } from "./components/ChapterCapsuleMarker";
import { HandleDragIcon } from "./components/HandleDragIcon";
import {
  MobilePreviewModal,
  mobileDeviceDimensions,
} from "./components/MobilePreviewModal";
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

  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("none");

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
  const [mobileChaptersOpen, setMobileChaptersOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [mobileBookMindOpen, setMobileBookMindOpen] = useState(false);
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

        setRightPanelMode("live-preview");
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
      setRightPanelMode("none");
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
      setRightPanelMode((prev) =>
        prev === "live-preview" ? "none" : "live-preview",
      );
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

  function handleNewBook() {
    setShowMarketingPage(false);
    handleNewBookConfirm();
  }

  function handlePasteManuscript(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    track("manuscript_pasted", { wordCount });
    setShowMarketingPage(false);
    const newChapter: Chapter = {
      id: uuidv4(),
      type: "content",
      title: "Chapter 1",
      content: trimmed,
    };
    setChapters([newChapter]);
    setTitle("Pasted manuscript");
    setAuthor("");
    setSelectedChapter(0);
    markDirty();
    setSidebarView("book");
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

      <div className="bg-white dark:bg-[#1e1e1e] text-[#15161a] dark:text-[#e5e5e5]">
        {newBookConfirmOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1e1e1e] rounded shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Start New Book?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This will save your current book and start a new one. All your
                current work will be preserved in the library.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setNewBookConfirmOpen(false)}
                  className="flex-1 px-4 py-2 rounded border border-[#E8E8E8] dark:border-gray-600 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-[#F2F2F2] dark:hover:bg-gray-800 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleNewBookConfirm}
                  className="flex-1 px-4 py-2 rounded bg-[#181a1d] dark:bg-[#262626] text-white text-sm font-medium hover:bg-[#23252a] dark:hover:bg-[#3a3a3a] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {saveDialogOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1e1e1e] rounded shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Save Book
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This book already exists in your library. Do you want to
                overwrite the existing version or save as a new version?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSaveDialogOpen(false)}
                  className="flex-1 px-4 py-2 rounded border border-[#E8E8E8] dark:border-gray-600 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-[#F2F2F2] dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBook.handleOverwriteBook}
                  className="flex-1 px-4 py-2 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Overwrite
                </button>
                <button
                  onClick={saveBook.handleSaveAsNewVersion}
                  className="flex-1 px-4 py-2 rounded bg-[#181a1d] dark:bg-[#262626] text-white text-sm font-medium hover:bg-[#23252a] dark:hover:bg-[#3a3a3a] transition-colors"
                >
                  Save as New
                </button>
              </div>
            </div>
          </div>
        )}

        {docImport.importDialogOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Import Document
                </h2>
                <button
                  onClick={() => docImport.setImportDialogOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
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

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Upload a document to automatically parse chapters and create a
                new book.
              </p>

              <div className="mb-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                <input
                  ref={docImport.importFileInputRef}
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={docImport.handleImportFileSelect}
                  className="hidden"
                />

                <div className="mb-3">
                  <svg
                    className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500"
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

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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

              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
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

        {mobilePreviewOpen && (
          <MobilePreviewModal
            chapters={chapters}
            selectedChapter={selectedChapter}
            onChapterSelect={setSelectedChapter}
            onClose={() => setMobilePreviewOpen(false)}
          />
        )}

        {mobileBookMindOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col animate-slide-in-from-bottom bg-white dark:bg-[#252525]">
            <div className="flex items-center justify-end px-3 py-2 border-b border-gray-200 dark:border-[#2f2f2f] flex-shrink-0">
              <button
                onClick={() => setMobileBookMindOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors"
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
            className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ease-out ${
              mobileSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div
            className={`absolute top-0 left-0 h-full w-full bg-white dark:bg-[#1e1e1e] shadow-2xl transform transition-transform duration-200 ease-out ${
              mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-[#2f2f2f]">
                <div className="flex items-center justify-between pr-0">
                  <button
                    onClick={() => {
                      handleGoToHome();
                      setMobileSidebarOpen(false);
                    }}
                    className="hover:opacity-70 transition-opacity"
                    aria-label="Go to home"
                  >
                    <Image
                      src="/make-ebook-logomark.svg"
                      alt="makeEBook logo"
                      width={100}
                      height={39}
                      className="h-[39px] w-[100px] dark:invert"
                      priority
                    />
                  </button>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="px-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    aria-label="Close sidebar"
                  >
                    <img
                      src="/close-sidebar-icon.svg"
                      alt="Close"
                      className="w-5 h-5 dark:invert"
                    />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500">
                <div className="px-4 space-y-2 py-2">
                  <div className="border-b border-gray-200 dark:border-[#2f2f2f] pb-2">
                    <button
                      onClick={() => expandMobileSection("library")}
                      className="flex items-center justify-between py-2 w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 flex-shrink-0 text-[#050505] dark:text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="4" y="4" width="3" height="16" rx="0.5" />
                          <rect x="10" y="7" width="3" height="13" rx="0.5" />
                          <rect x="16" y="5" width="3" height="15" rx="0.5" />
                          <path d="M3 20h18" />
                        </svg>
                        <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">
                          Library
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          ({libraryBooks.length})
                        </span>
                        {cloudSync.syncConflicts.length > 0 && (
                          <span
                            aria-label="Action needed"
                            className="w-2 h-2 rounded-full bg-red-500"
                          />
                        )}
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                          sidebarLibraryExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    <CollapsibleSection expanded={sidebarLibraryExpanded}>
                      <>
                        <SyncConflictBanner
                          conflicts={cloudSync.syncConflicts}
                          onResolve={cloudSync.handleResolveSyncConflict}
                        />

                        <div className="flex items-center gap-1 pb-2 mb-1 border-b border-gray-100 dark:border-gray-800">
                          {libraryBooks.length > 0 && (
                            <button
                              onClick={() => {
                                library.setMultiSelectMode(
                                  !library.multiSelectMode,
                                );
                                if (library.multiSelectMode)
                                  library.setSelectedBookIds(new Set());
                              }}
                              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors ${library.multiSelectMode ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"}`}
                              title={
                                library.multiSelectMode
                                  ? "Cancel selection"
                                  : "Select multiple"
                              }
                            >
                              <svg
                                className={`w-4 h-4 ${library.multiSelectMode ? "text-blue-600 dark:text-blue-400" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth={1.6}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle
                                  className={
                                    library.multiSelectMode
                                      ? ""
                                      : "dark:stroke-white"
                                  }
                                  cx="12"
                                  cy="12"
                                  r="9"
                                />
                                <path
                                  className={
                                    library.multiSelectMode
                                      ? ""
                                      : "dark:stroke-white"
                                  }
                                  d="M8.5 12l2.5 2.5 4.5-4.5"
                                />
                              </svg>
                              <span
                                className={`text-2xs font-medium ${library.multiSelectMode ? "text-blue-600 dark:text-blue-400" : "text-[#050505] dark:text-[#e5e5e5]"}`}
                              >
                                {library.multiSelectMode ? "Cancel" : "Select"}
                              </span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              showNewBookConfirmation();
                              setMobileSidebarOpen(false);
                            }}
                            className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                            title="New book"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={1.6}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path
                                className="dark:stroke-white"
                                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                              />
                              <path
                                className="dark:stroke-white"
                                d="M14 2v6h6"
                              />
                              <path
                                className="dark:stroke-white"
                                d="M9 14h6M12 11v6"
                              />
                            </svg>
                            <span className="text-2xs font-medium text-[#050505] dark:text-[#e5e5e5]">
                              New
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              docImport.showImportDialog();
                              setMobileSidebarOpen(false);
                            }}
                            className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                            title="Import document"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={1.6}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path
                                className="dark:stroke-white"
                                d="M12 3v12M7.5 10l4.5 5 4.5-5"
                              />
                              <path
                                className="dark:stroke-white"
                                d="M4 19h16"
                              />
                            </svg>
                            <span className="text-2xs font-medium text-[#050505] dark:text-[#e5e5e5]">
                              Import
                            </span>
                          </button>
                        </div>
                        {library.multiSelectMode && libraryBooks.length > 0 && (
                          <div className="flex items-center justify-between mt-2 px-2 py-1.5 bg-gray-50 dark:bg-[#262626] rounded-md">
                            <button
                              onClick={library.toggleSelectAll}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {library.selectedBookIds.size ===
                              libraryBooks.length
                                ? "Deselect All"
                                : "Select All"}
                            </button>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {library.selectedBookIds.size} selected
                            </span>
                            <button
                              onClick={library.handleDeleteSelectedBooks}
                              disabled={library.selectedBookIds.size === 0}
                              className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Delete Selected
                            </button>
                          </div>
                        )}
                        <div className="mt-2 space-y-1 pl-2">
                          {libraryLoading ? (
                            <div className="space-y-2 py-2 px-2">
                              {[1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="animate-pulse flex items-center gap-2"
                                >
                                  <div className="h-3 bg-gray-200 dark:bg-[#2f2f2f] rounded w-3/4" />
                                  <div className="h-2 bg-gray-100 dark:bg-[#262626] rounded w-1/4" />
                                </div>
                              ))}
                            </div>
                          ) : libraryBooks.length === 0 ? (
                            <div className="text-xs text-gray-600 dark:text-gray-400 py-4 px-2 text-center">
                              No saved books yet
                            </div>
                          ) : (
                            libraryBooks.map((book) => {
                              const isSelected = selectedBookId === book.id;
                              const isChecked = library.selectedBookIds.has(
                                book.id,
                              );
                              return (
                                <div
                                  key={book.id}
                                  className={`group flex items-center justify-between py-2 px-2 rounded transition-colors ${
                                    isSelected || isChecked
                                      ? "bg-gray-100 dark:bg-[#262626]"
                                      : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                                  }`}
                                >
                                  {library.multiSelectMode && (
                                    <label className="flex items-center mr-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() =>
                                          library.toggleBookSelection(book.id)
                                        }
                                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                                      />
                                    </label>
                                  )}
                                  <button
                                    onClick={() =>
                                      library.multiSelectMode
                                        ? library.toggleBookSelection(book.id)
                                        : setSelectedBookId(
                                            isSelected ? null : book.id,
                                          )
                                    }
                                    className="flex-1 text-left"
                                  >
                                    <div
                                      className={`text-sm font-medium truncate ${
                                        isSelected || isChecked
                                          ? "text-gray-900 dark:text-gray-100"
                                          : "text-gray-600 dark:text-gray-400"
                                      }`}
                                    >
                                      {book.title || "Untitled"}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                      {book.author || "Unknown"}
                                    </div>
                                  </button>
                                  {!library.multiSelectMode && isSelected && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => {
                                          library.handleLoadBook(book.id);
                                          setSelectedBookId(null);
                                        }}
                                        className="px-2 py-1 text-xs rounded bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
                                        title="Load book"
                                      >
                                        Open
                                      </button>
                                      <button
                                        onClick={() =>
                                          library.handleExportLibraryBook(
                                            book.id,
                                          )
                                        }
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded hidden"
                                        title="Export as EPUB"
                                      >
                                        <img
                                          src="/export-download-icon.svg"
                                          alt="Export"
                                          className="w-4 h-4 dark:hidden"
                                        />
                                        <img
                                          src="/dark-export-download-icon.svg"
                                          alt="Export"
                                          className="w-4 h-4 hidden dark:block"
                                        />
                                      </button>
                                      <button
                                        onClick={() =>
                                          library.handleDeleteBook(book.id)
                                        }
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded"
                                        title="Delete"
                                      >
                                        <TrashIcon className="w-4 h-4 dark:invert" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    </CollapsibleSection>
                  </div>

                  <div
                    className={`border-b border-gray-200 dark:border-[#2f2f2f] pb-2 transition-colors duration-1000 ease-out ${
                      bookJustLoaded ? "bg-gray-100/80 dark:bg-gray-700/20" : ""
                    }`}
                  >
                    <button
                      onClick={() => expandMobileSection("book")}
                      className="flex items-center justify-between py-2 w-full text-left"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg
                          className="w-5 h-5 flex-shrink-0 text-[#050505] dark:text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          <path d="M8 7h8M8 11h8M8 15h5" />
                        </svg>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">
                            Book
                          </span>
                          {title && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {title}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                          sidebarBookDetailsExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    <CollapsibleSection expanded={sidebarBookDetailsExpanded}>
                      <div className="mt-2 space-y-3 pl-2 pr-2">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                          <button
                            onClick={() => saveBook.handleSaveBook()}
                            disabled={!!saveFeedback}
                            className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-50"
                            title={saveFeedback ? "Saved!" : "Save book"}
                          >
                            {saveFeedback ? (
                              <svg
                                className="w-4 h-4 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.6}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <SaveIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                            )}
                            <span
                              className={`text-xs font-medium ${saveFeedback ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-gray-300"}`}
                            >
                              {saveFeedback ? "Saved!" : "Save"}
                            </span>
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors">
                                <DownloadIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  Export
                                </span>
                                <ChevronDown className="w-3 h-3 text-gray-400" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-44 z-[200]"
                            >
                              <DropdownMenuItem
                                onClick={() => setPreflightFormat("epub")}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <DownloadIcon className="w-4 h-4" />
                                <div>
                                  <div className="text-sm font-medium">
                                    EPUB
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Kindle, Kobo, Apple Books
                                  </div>
                                </div>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setPreflightFormat("pdf")}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <DownloadIcon className="w-4 h-4" />
                                <div>
                                  <div className="text-sm font-medium">PDF</div>
                                  <div className="text-xs text-gray-500">
                                    Print & sharing
                                  </div>
                                </div>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setPreflightFormat("docx")}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <DownloadIcon className="w-4 h-4" />
                                <div>
                                  <div className="text-sm font-medium">
                                    Word
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Editors & agents
                                  </div>
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                            Cover Image
                          </label>
                          <div className="w-full aspect-[2/3] max-h-52 bg-gray-100 dark:bg-[#2a2a2a] rounded border border-gray-200 dark:border-[#2f2f2f] overflow-hidden flex items-center justify-center mb-2">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt="Cover"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src="/image-icon.svg"
                                alt=""
                                className="w-8 h-8 opacity-30 dark:opacity-20"
                              />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            disabled={lockedSections.bookInfo}
                            className="w-full text-sm text-[#C0C0C0] file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-[#2a2a2a] file:text-[#050505] dark:file:text-[#e5e5e5] hover:file:bg-gray-200 dark:hover:file:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="Book title"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                            Author
                          </label>
                          <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="Author name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                            Description
                          </label>
                          <textarea
                            value={blurb}
                            onChange={(e) => setBlurb(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] resize-none"
                            placeholder="Brief description"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                            Publisher
                          </label>
                          <input
                            type="text"
                            value={publisher}
                            onChange={(e) => setPublisher(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="Publisher name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                            Publication Date
                          </label>
                          <input
                            type="date"
                            value={pubDate}
                            onChange={(e) => setPubDate(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                            Language
                          </label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                          >
                            {LANGUAGES.map((lang) => (
                              <option key={lang} value={lang}>
                                {lang}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                            Genre
                          </label>
                          <input
                            type="text"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="e.g. Fiction, Mystery"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                            ISBN
                          </label>
                          <input
                            type="text"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="ISBN number"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                            Tags
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleAddTag()
                              }
                              disabled={lockedSections.bookInfo}
                              className="flex-1 px-3 py-2 text-sm rounded bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#2f2f2f] focus:border-black dark:focus:border-white outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                              placeholder="e.g., fiction, thriller, mystery, romance"
                            />
                            <button
                              onClick={handleAddTag}
                              disabled={lockedSections.bookInfo}
                              className="px-3 py-2 rounded bg-gray-100 dark:bg-[#262626] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                            </button>
                          </div>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-[#262626] text-[#050505] dark:text-[#e5e5e5]"
                                >
                                  {tag}
                                  <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-red-500 dark:hover:text-red-400"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleSection>
                  </div>

                  <div className="border-b border-gray-200 dark:border-[#2f2f2f] pb-2">
                    <button
                      onClick={() => expandMobileSection("chapters")}
                      className="flex items-center justify-between py-2 w-full text-left"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg
                          className="w-5 h-5 flex-shrink-0 text-[#050505] dark:text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                          <path d="M16 13H8M16 17H8M10 9H8" />
                        </svg>
                        <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">
                          Chapters
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          ({chapters.length})
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                          sidebarChaptersExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    <CollapsibleSection expanded={sidebarChaptersExpanded}>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center gap-1 pb-2 mb-1 border-b border-gray-100 dark:border-gray-800">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setChapterTypeDropdownOpen(
                                  !chapterTypeDropdownOpen,
                                )
                              }
                              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                              title="Add chapter"
                            >
                              <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Add
                              </span>
                            </button>

                            {chapterTypeDropdownOpen && (
                              <div
                                ref={dropdownRef}
                                className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl border border-gray-200 dark:border-[#2f2f2f] z-50 py-2 max-h-96 overflow-y-auto"
                              >
                                <div className="space-y-3 px-2">
                                  <div>
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                      Front Matter
                                    </div>
                                    {CHAPTER_TEMPLATES.frontmatter.map(
                                      (template) => (
                                        <button
                                          key={template.title}
                                          onClick={() => {
                                            const newChapterId =
                                              handleAddChapter(
                                                "frontmatter",
                                                template.title ===
                                                  "Custom Front Matter"
                                                  ? ""
                                                  : template.title,
                                              );
                                            setChapterTypeDropdownOpen(false);
                                            setSidebarChaptersExpanded(true);
                                            setChapterJustAdded(newChapterId);
                                            setTimeout(
                                              () => setChapterJustAdded(null),
                                              1000,
                                            );
                                          }}
                                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                                        >
                                          {template.title}
                                        </button>
                                      ),
                                    )}
                                  </div>

                                  <div>
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                      Main Content
                                    </div>
                                    {CHAPTER_TEMPLATES.content.map(
                                      (template) => (
                                        <button
                                          key={template.title}
                                          onClick={() => {
                                            const newChapterId =
                                              handleAddChapter(
                                                "content",
                                                template.title ===
                                                  "Custom Chapter"
                                                  ? ""
                                                  : template.title,
                                              );
                                            setChapterTypeDropdownOpen(false);
                                            setSidebarChaptersExpanded(true);
                                            setChapterJustAdded(newChapterId);
                                            setTimeout(
                                              () => setChapterJustAdded(null),
                                              1000,
                                            );
                                          }}
                                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                                        >
                                          {template.title}
                                        </button>
                                      ),
                                    )}
                                  </div>

                                  <div>
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                      Back Matter
                                    </div>
                                    {CHAPTER_TEMPLATES.backmatter.map(
                                      (template) => (
                                        <button
                                          key={template.title}
                                          onClick={() => {
                                            const newChapterId =
                                              handleAddChapter(
                                                "backmatter",
                                                template.title ===
                                                  "Custom Back Matter"
                                                  ? ""
                                                  : template.title,
                                              );
                                            setChapterTypeDropdownOpen(false);
                                            setSidebarChaptersExpanded(true);
                                            setChapterJustAdded(newChapterId);
                                            setTimeout(
                                              () => setChapterJustAdded(null),
                                              1000,
                                            );
                                          }}
                                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                                        >
                                          {template.title}
                                        </button>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-2xs text-gray-600 dark:text-gray-400 px-2 mb-1">
                          Drag to reorder
                        </p>
                        {chapters.map((ch, i) => {
                          const isSelected = selectedChapter === i;
                          const titleText = ch.title?.trim() || "Title";

                          const getChapterInfo = () => {
                            if (ch.type === "frontmatter") {
                              return {
                                typeLabel: "Frontmatter",
                                title:
                                  titleText && titleText !== "Title"
                                    ? titleText
                                    : "Title",
                              };
                            }
                            if (ch.type === "backmatter") {
                              return {
                                typeLabel: "Backmatter",
                                title:
                                  titleText && titleText !== "Title"
                                    ? titleText
                                    : "Title",
                              };
                            }
                            const contentChapterNum = getContentChapterNumber(
                              chapters,
                              i,
                            );
                            return {
                              typeLabel: `Chapter ${contentChapterNum}`,
                              title:
                                titleText && titleText !== "Title"
                                  ? titleText
                                  : "Title",
                            };
                          };

                          const { typeLabel, title: chapterTitle } =
                            getChapterInfo();
                          const isJustAdded = chapterJustAdded === ch.id;

                          return (
                            <div
                              key={ch.id}
                              className={`group flex items-center gap-2 px-2 py-2 rounded text-sm cursor-pointer select-none transition-all duration-1000 ease-out ${
                                dragOverIndex === i
                                  ? "border-2 border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                                  : isSelected
                                    ? "bg-gray-100 dark:bg-[#262626] border border-transparent"
                                    : isJustAdded
                                      ? "bg-gray-100/80 dark:bg-gray-700/20 border border-transparent"
                                      : "border border-transparent hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                              }`}
                              style={
                                {
                                  opacity:
                                    dragItemIndex === i &&
                                    ghostPillPosition.visible
                                      ? 0.3
                                      : 1,
                                } as React.CSSProperties
                              }
                              draggable
                              onDragStart={() => handleDragStart(i)}
                              onDragEnter={() => handleDragEnter(i)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => e.preventDefault()}
                              onTouchStart={(e) => handleTouchStart(i, e)}
                              onTouchMove={(e) => handleTouchMove(i, e)}
                              onTouchEnd={handleTouchEnd}
                              onClick={() => {
                                handleSelectChapter(i);
                              }}
                            >
                              <HandleDragIcon isSelected={isSelected} />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span
                                  className={`text-2xs ${isSelected ? "text-gray-400 dark:text-gray-400" : "text-gray-500 dark:text-gray-500"}`}
                                >
                                  {typeLabel}
                                </span>
                                <span
                                  className={`text-sm truncate ${isSelected ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-600 dark:text-gray-400"}`}
                                >
                                  {chapterTitle}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  className="lg:hidden opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectChapter(i);
                                    setMobileSidebarOpen(false);
                                  }}
                                  aria-label="Edit chapter"
                                  title="Edit chapter"
                                >
                                  <img
                                    src="/pencil-icon.svg"
                                    alt="Edit"
                                    className="w-4 h-4 dark:hidden"
                                  />
                                  <img
                                    src="/dark-pencil-icon.svg"
                                    alt="Edit"
                                    className="w-4 h-4 hidden dark:block"
                                  />
                                </button>

                                <button
                                  className={`transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded ${ch.locked ? "opacity-100 text-gray-600 dark:text-gray-300" : "opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500"}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleChapterLock(i);
                                  }}
                                  aria-label={
                                    ch.locked
                                      ? "Unlock chapter"
                                      : "Lock chapter"
                                  }
                                  title={
                                    ch.locked
                                      ? "Unlock chapter"
                                      : "Mark complete and lock"
                                  }
                                >
                                  {ch.locked ? (
                                    <svg
                                      className="w-4 h-4"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={1.6}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <rect
                                        x="3"
                                        y="11"
                                        width="18"
                                        height="11"
                                        rx="2"
                                        ry="2"
                                      />
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={1.6}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <rect
                                        x="3"
                                        y="11"
                                        width="18"
                                        height="11"
                                        rx="2"
                                        ry="2"
                                      />
                                      <path d="M7 11V7a5 5 0 0 1 10 0" />
                                    </svg>
                                  )}
                                </button>

                                {chapters.length > 1 &&
                                  !ch.locked &&
                                  (pendingDeleteIndex === i ? (
                                    <div
                                      data-chapter-delete-confirm
                                      role="group"
                                      aria-label="Confirm chapter deletion"
                                      className="flex items-center gap-0.5 animate-in fade-in zoom-in-95 slide-in-from-right-1 duration-150"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span
                                        className="px-1.5 text-2xs font-medium text-gray-500 dark:text-gray-400 italic"
                                        style={{ fontFamily: "Georgia, serif" }}
                                      >
                                        Delete?
                                      </span>
                                      <button
                                        autoFocus
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          confirmChapterDelete(i);
                                        }}
                                        className="p-1 rounded bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
                                        aria-label="Confirm delete"
                                        title="Delete (Enter)"
                                      >
                                        <svg
                                          className="w-3.5 h-3.5"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2.6}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPendingDeleteIndex(null);
                                        }}
                                        className="p-1 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-colors"
                                        aria-label="Cancel"
                                        title="Cancel (Esc)"
                                      >
                                        <svg
                                          className="w-3.5 h-3.5"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2.2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <line x1="18" y1="6" x2="6" y2="18" />
                                          <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded text-gray-600 dark:text-gray-400"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPendingDeleteIndex(i);
                                      }}
                                      aria-label="Delete chapter"
                                    >
                                      <BinIcon className="w-4 h-4" />
                                    </button>
                                  ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleSection>
                  </div>
                </div>
              </div>

              <footer className="flex-shrink-0 py-1.5 px-4 border-t border-gray-200 dark:border-[#2f2f2f] bg-white dark:bg-[#1e1e1e]">
                <div className="flex items-center justify-between">
                  <UserDropdownMobile />
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-[#737373]">
                    <button
                      onClick={() => {
                        setMobileSidebarOpen(false);
                        onboarding.resetOnboarding();
                        if (chapters.length === 0) clearEditorState();
                        setTimeout(
                          () => onboarding.startTour(),
                          chapters.length === 0 ? 800 : 400,
                        );
                      }}
                      className="hover:text-gray-600 dark:hover:text-[#a3a3a3] transition-colors"
                    >
                      Tour
                    </button>
                    <a
                      href="https://makeebook.ink/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-600 dark:hover:text-[#a3a3a3] transition-colors"
                    >
                      Terms
                    </a>
                    <a
                      href="https://makeebook.ink/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-600 dark:hover:text-[#a3a3a3] transition-colors"
                    >
                      Privacy
                    </a>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>

        <div
          className={`fixed top-0 right-0 bottom-0 z-[100] lg:hidden transition-[visibility] duration-200 ease-out ${
            mobileChaptersOpen ? "visible" : "invisible"
          }`}
          style={{ left: 0 }}
        >
          <div
            className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ease-out ${
              mobileChaptersOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMobileChaptersOpen(false)}
          />

          <div
            className={`absolute top-0 right-0 h-full w-full bg-white dark:bg-[#1e1e1e] shadow-2xl transform transition-transform duration-200 ease-out ${
              mobileChaptersOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 flex-shrink-0 text-[#050505] dark:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8M16 17H8M10 9H8" />
                  </svg>
                  <h3 className="text-sm font-bold text-[#050505] dark:text-[#e5e5e5]">
                    Chapters list
                  </h3>
                </div>
                <button
                  onClick={() => setMobileChaptersOpen(false)}
                  className="flex items-center justify-center px-5 py-4 rounded-full bg-white dark:bg-[#1e1e1e] gap-2 focus:outline-none transition-opacity relative"
                  aria-label="Close chapters menu"
                  style={{ minWidth: 56, minHeight: 56 }}
                >
                  <span
                    className="absolute inset-0"
                    style={{ zIndex: 1 }}
                  ></span>
                  <img
                    alt="Close"
                    loading="lazy"
                    width="28"
                    height="28"
                    decoding="async"
                    data-nimg="1"
                    className="w-5 h-5 dark:invert"
                    style={{ color: "transparent", zIndex: 2 }}
                    src="/close-sidebar-icon.svg"
                  />
                  <span
                    className="text-base font-medium text-[#23242a] dark:text-[#e5e5e5] underline"
                    style={{ zIndex: 2 }}
                  >
                    Close
                  </span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <p className="text-2xs text-[#737373] dark:text-gray-400 mb-3">
                  Drag to reorder
                </p>

                <div className="flex flex-col gap-2">
                  {chapters.map((ch, i) => {
                    const isSelected = selectedChapter === i;
                    const titleText = ch.title?.trim() || "Title";

                    const getChapterInfo = () => {
                      if (ch.type === "frontmatter") {
                        return {
                          typeLabel: "Frontmatter",
                          title:
                            titleText && titleText !== "Title"
                              ? titleText
                              : "Title",
                        };
                      }
                      if (ch.type === "backmatter") {
                        return {
                          typeLabel: "Backmatter",
                          title:
                            titleText && titleText !== "Title"
                              ? titleText
                              : "Title",
                        };
                      }

                      const contentChapterNum = getContentChapterNumber(
                        chapters,
                        i,
                      );
                      return {
                        typeLabel: `Chapter ${contentChapterNum}`,
                        title:
                          titleText && titleText !== "Title"
                            ? titleText
                            : "Title",
                      };
                    };

                    const { typeLabel, title } = getChapterInfo();
                    const isJustAdded = chapterJustAdded === ch.id;

                    return (
                      <div
                        key={i}
                        ref={(el) => {
                          chapterRefs.current[i] = el;
                        }}
                        className={`group flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer select-none relative focus:outline-none transition-all duration-1000 ease-out ${
                          dragOverIndex === i
                            ? "border-2 border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                            : isSelected
                              ? "bg-gray-100 dark:bg-[#262626] border border-transparent"
                              : isJustAdded
                                ? "bg-gray-100/80 dark:bg-gray-700/20 border border-transparent"
                                : "border border-transparent hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        }`}
                        style={
                          {
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            WebkitTouchCallout: "none",
                            WebkitUserDrag: "none",
                            opacity:
                              dragItemIndex === i && ghostPillPosition.visible
                                ? 0.3
                                : 1,
                          } as React.CSSProperties
                        }
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragEnter={() => handleDragEnter(i)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        onTouchStart={(e) => handleTouchStart(i, e)}
                        onTouchMove={(e) => handleTouchMove(i, e)}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => handleSelectChapter(i)}
                      >
                        <HandleDragIcon isSelected={isSelected} />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span
                            className={`text-2xs ${isSelected ? "text-gray-400 dark:text-gray-400" : "text-gray-500 dark:text-gray-500"}`}
                          >
                            {typeLabel}
                          </span>
                          <span
                            className={`text-sm truncate ${isSelected ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-600 dark:text-gray-400"}`}
                          >
                            {title}
                          </span>
                        </div>

                        <button
                          className={`transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded ${ch.locked ? "opacity-100 text-gray-600 dark:text-gray-300" : "opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleChapterLock(i);
                          }}
                          aria-label={
                            ch.locked ? "Unlock chapter" : "Lock chapter"
                          }
                          title={
                            ch.locked
                              ? "Unlock chapter"
                              : "Mark complete and lock"
                          }
                        >
                          {ch.locked ? (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.6}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                              />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.6}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                              />
                              <path d="M7 11V7a5 5 0 0 1 10 0" />
                            </svg>
                          )}
                        </button>

                        {chapters.length > 1 &&
                          !ch.locked &&
                          (pendingDeleteIndex === i ? (
                            <div
                              data-chapter-delete-confirm
                              role="group"
                              aria-label="Confirm chapter deletion"
                              className="flex items-center gap-0.5 animate-in fade-in zoom-in-95 slide-in-from-right-1 duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span
                                className="px-1.5 text-2xs font-medium text-gray-500 dark:text-gray-400 italic"
                                style={{ fontFamily: "Georgia, serif" }}
                              >
                                Delete?
                              </span>
                              <button
                                autoFocus
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmChapterDelete(i);
                                }}
                                className="p-1 rounded bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
                                aria-label="Confirm delete"
                                title="Delete (Enter)"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.6}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPendingDeleteIndex(null);
                                }}
                                className="p-1 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-colors"
                                aria-label="Cancel"
                                title="Cancel (Esc)"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2.2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded text-gray-600 dark:text-gray-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingDeleteIndex(i);
                              }}
                              aria-label="Delete Chapter"
                            >
                              <BinIcon className="w-4 h-4" />
                            </button>
                          ))}
                      </div>
                    );
                  })}

                  <div className="relative mt-2">
                    <button
                      onClick={() =>
                        setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)
                      }
                      aria-label="Add new chapter"
                      className="hover:opacity-70 transition-opacity flex items-center gap-2 w-full px-3 py-2 bg-white dark:bg-[#262626] rounded border border-gray-200 dark:border-[#2f2f2f] shadow-sm"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium text-[#050505] dark:text-[#e5e5e5]">
                        Add Chapter
                      </span>
                    </button>
                    {chapterTypeDropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className="absolute z-50 top-full left-0 mt-1 w-full bg-white dark:bg-[#1e1e1e] rounded border border-[#E8E8E8] dark:border-[#2f2f2f] shadow-lg max-h-96 overflow-y-auto"
                      >
                        <div className="p-3">
                          <div className="space-y-4">
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold px-3 uppercase tracking-wider">
                                  <span className="text-[#050505] dark:text-white">
                                    Front Matter
                                  </span>
                                </h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.frontmatter.map(
                                  (template) => (
                                    <button
                                      key={template.title}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const newChapterId = handleAddChapter(
                                          "frontmatter",
                                          template.title ===
                                            "Custom Front Matter"
                                            ? ""
                                            : template.title,
                                        );
                                        setChapterTypeDropdownOpen(false);
                                        setSidebarChaptersExpanded(true);

                                        setChapterJustAdded(newChapterId);
                                        setTimeout(
                                          () => setChapterJustAdded(null),
                                          1000,
                                        );
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] dark:hover:bg-[#2a2a2a] transition-colors"
                                    >
                                      <div className="text-sm font-medium">
                                        <span className="text-[#15161a] dark:text-white">
                                          {template.title}
                                        </span>
                                      </div>
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold px-3 uppercase tracking-wider">
                                  <span className="text-[#050505] dark:text-white">
                                    Main Content
                                  </span>
                                </h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.content.map((template) => (
                                  <button
                                    key={template.title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const newChapterId = handleAddChapter(
                                        "content",
                                        template.title === "Custom Chapter"
                                          ? ""
                                          : template.title,
                                      );
                                      setChapterTypeDropdownOpen(false);
                                      setSidebarChaptersExpanded(true);

                                      setChapterJustAdded(newChapterId);
                                      setTimeout(
                                        () => setChapterJustAdded(null),
                                        1000,
                                      );
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] dark:hover:bg-[#2a2a2a] transition-colors"
                                  >
                                    <div className="text-sm font-medium">
                                      <span className="text-[#15161a] dark:text-white">
                                        {template.title}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold px-3 uppercase tracking-wider">
                                  <span className="text-[#050505] dark:text-white">
                                    Back Matter
                                  </span>
                                </h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.backmatter.map(
                                  (template) => (
                                    <button
                                      key={template.title}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const newChapterId = handleAddChapter(
                                          "backmatter",
                                          template.title ===
                                            "Custom Back Matter"
                                            ? ""
                                            : template.title,
                                        );
                                        setChapterTypeDropdownOpen(false);
                                        setSidebarChaptersExpanded(true);

                                        setChapterJustAdded(newChapterId);
                                        setTimeout(
                                          () => setChapterJustAdded(null),
                                          1000,
                                        );
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] dark:hover:bg-[#2a2a2a] transition-colors"
                                    >
                                      <div className="text-sm font-medium">
                                        <span className="text-[#15161a] dark:text-white">
                                          {template.title}
                                        </span>
                                      </div>
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
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
              onBookMindToggle={() =>
                setRightPanelMode((prev) =>
                  prev === "inspector" ? "none" : "inspector",
                )
              }
              rightPanelMode={rightPanelMode}
              libraryBooks={libraryBooks}
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
            className={`flex-1 flex flex-col bg-white dark:bg-[#1e1e1e] ${chapters.length === 0 ? "px-0 py-0" : "px-2 py-8"} ${chapters.length > 0 ? "lg:pl-0" : "lg:pl-0"} lg:pr-0 lg:py-0 min-w-0 overflow-x-hidden overflow-y-auto relative`}
          >
            {chapters.length > 0 && (
              <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-white dark:bg-[#1e1e1e]">
                <div className="flex items-center justify-between px-2 py-1.5 gap-1 border-b border-gray-200 dark:border-[#2f2f2f]">
                  <div className="flex items-center gap-0.5">
                    <button
                      data-tour="mobile-menu"
                      onClick={() => setMobileSidebarOpen(true)}
                      className="p-1.5 ml-[5px] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors flex-shrink-0"
                      aria-label="Open menu"
                    >
                      <img
                        src="/hamburger-menu-icon.svg"
                        alt="Menu"
                        className="w-5 h-5 dark:hidden"
                      />
                      <img
                        src="/dark-hamburger-menu-icon.svg"
                        alt="Menu"
                        className="w-5 h-5 hidden dark:block"
                      />
                    </button>
                  </div>

                  {chapters.length > 0 && (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <div className="lg:hidden">
                        <ChapterNavDropdown
                          chapters={chapters}
                          selectedChapter={selectedChapter}
                          onChapterSelect={setSelectedChapter}
                          bookTitle={title}
                        />
                      </div>

                      <button
                        onClick={() => setMobileBookMindOpen(true)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Book Mind"
                        title="Book Mind"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 dark:text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.6}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </button>

                      <button
                        data-tour="mobile-preview"
                        onClick={() => setMobilePreviewOpen(true)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Preview book"
                        title="Preview"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600 dark:text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {isDirty && (
                  <div className="flex items-center justify-center gap-2 px-3 py-1 bg-stone-100 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs text-stone-600 dark:text-stone-400">
                      Unsaved changes
                    </span>
                    {!isSaving && (
                      <button
                        onClick={() => {
                          void saveBook.saveBookDirectly(false);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors"
                      >
                        <SaveIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Save
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="hidden lg:block"></div>

            <div
              data-tour="mobile-editor"
              className={`lg:hidden flex flex-col ${chapters.length === 0 ? "" : "gap-2 pt-[52px]"} flex-1 min-h-0 overflow-y-auto pb-0`}
            >
              {chapters.length === 0 ? (
                <EmptyEditorState
                  onNewBook={handleNewBook}
                  onPasteManuscript={handlePasteManuscript}
                  onUploadFile={docImport.showImportDialog}
                  onOpenLibrary={() => setMobileSidebarOpen(true)}
                  libraryBooks={libraryBooks}
                  libraryLoading={libraryLoading}
                  onOpenBook={(id) => library.handleLoadBook(id)}
                />
              ) : (
                <>
                  <div className="flex-shrink-0 bg-white dark:bg-[#1e1e1e] border-none pb-1 px-2 transition-all duration-200">
                    <div className="mt-0">
                      <div className="flex items-center gap-0 py-1">
                        <img
                          alt="Chapter"
                          loading="lazy"
                          width="24"
                          height="24"
                          decoding="async"
                          data-nimg="1"
                          className="w-6 h-6 flex-shrink-0 dark:hidden"
                          style={{ color: "transparent" }}
                          src="/chapter-title-icon.svg"
                        />
                        <img
                          alt="Chapter"
                          loading="lazy"
                          width="24"
                          height="24"
                          decoding="async"
                          data-nimg="1"
                          className="w-6 h-6 flex-shrink-0 hidden dark:block"
                          style={{ color: "transparent" }}
                          src="/dark-chapter-title-icon.svg"
                        />
                        <input
                          className="flex-1 bg-transparent text-base sm:text-lg font-medium text-[#23242a] dark:text-[#e5e5e5] border-none outline-none focus:outline-none focus:ring-0 focus:border-none placeholder:text-[#a0a0a0] dark:placeholder:text-[#a0a0a0] placeholder:font-normal touch-manipulation min-w-0"
                          style={{
                            border: "none",
                            backgroundColor: "transparent",
                            boxShadow: "none",
                            fontSize: "max(16px, 1.125rem)",
                          }}
                          placeholder="Give your chapter a title..."
                          value={chapters[selectedChapter]?.title ?? ""}
                          onChange={(e) =>
                            handleChapterTitleChange(
                              selectedChapter,
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 pb-20 sm:pb-0 relative flex flex-col">
                    <div
                      className="flex-1 min-h-0"
                      style={{ minHeight: "400px" }}
                    >
                      {chapters[selectedChapter]?.locked && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#262626] border-b border-gray-200 dark:border-[#2f2f2f] text-xs text-gray-500 dark:text-gray-400">
                          <LockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>
                            This chapter is locked. Click the lock icon in the
                            chapter list to edit.
                          </span>
                        </div>
                      )}
                      <RichTextEditor
                        value={chapters[selectedChapter]?.content || ""}
                        onChange={(html) =>
                          handleChapterContentChange(selectedChapter, html)
                        }
                        minHeight={300}
                        placeholder={
                          selectedChapter === 0
                            ? "Write your first chapter here..."
                            : "Now add some content to your chapter..."
                        }
                        className="h-full text-lg placeholder:text-[#a0a0a0] placeholder:text-lg"
                        onCreateEndnote={endnotesHook.handleCreateEndnote}
                        chapterId={chapters[selectedChapter]?.id}
                        hasEndnotes={endnotes.length > 0}
                        disabled={!!chapters[selectedChapter]?.locked}
                        hideToolbar={focus.active && focus.settings.hideToolbar}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="hidden lg:flex flex-col flex-1 min-h-0 overflow-hidden">
              {chapters.length === 0 ? (
                <EmptyEditorState
                  onNewBook={handleNewBook}
                  onPasteManuscript={handlePasteManuscript}
                  onUploadFile={docImport.showImportDialog}
                  onOpenLibrary={() => setSidebarView("library")}
                  libraryBooks={libraryBooks}
                  libraryLoading={libraryLoading}
                  onOpenBook={(id) => library.handleLoadBook(id)}
                />
              ) : (
                <section className="flex flex-col min-w-0 flex-1 min-h-0 pt-2 bg-white dark:bg-[#1e1e1e]">
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
                    rightPanelMode={rightPanelMode}
                    onRightPanelModeChange={setRightPanelMode}
                    onExportEPUB={() => setPreflightFormat("epub")}
                    onExportPDF={() => setPreflightFormat("pdf")}
                    onExportDocx={() => setPreflightFormat("docx")}
                    hideChrome={focus.active && focus.settings.hideChrome}
                  />
                  <EditorCanvas
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
                    onBookMindHistory={
                      hasBookMind
                        ? () => setHistoryModal("versions")
                        : undefined
                    }
                  />
                </section>
              )}
            </div>
          </main>

          {!(focus.active && focus.settings.hideChrome) && (
            <EditorRightPanel
              mode={rightPanelMode}
              onClose={() => setRightPanelMode("none")}
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
        </div>
      </div>

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
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-900/90 dark:bg-[#2a2a2a]/95 text-white text-[11px] font-medium shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-1 duration-200"
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
    <Suspense fallback={<div>Creating makeEbook...</div>}>
      <MakeEbookPage />
    </Suspense>
  );
}
