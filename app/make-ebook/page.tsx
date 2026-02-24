"use client";
import React, { Suspense, useState, useRef, useLayoutEffect, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFeatureAccess } from "@/lib/hooks/useSubscription";
import { BookToolbar } from "@/components/BookToolbar";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PlusIcon, TrashIcon, CloseIcon, SaveIcon, DownloadIcon, BookIcon, LockIcon, MetadataIcon, MenuIcon } from "./components/icons";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import LandingPage from "./components/LandingPage";
import MarketingLandingPage from "./components/MarketingLandingPage";
import BinIcon from "./components/icons/BinIcon";
import { LANGUAGES, today } from "./utils/constants";
import { CHAPTER_TEMPLATES, Chapter, Endnote, EndnoteReference } from "./types";
import MetaTabContent from "./components/MetaTabContent";
import PreviewPanel from "./components/PreviewPanel";
import PreviewEreaderPanel from "./components/PreviewEreaderPanel";
import AiTabContent from "./components/AiTabContent";
import { useChapters } from "./hooks/useChapters";
import { useTags } from "./hooks/useTags";
import { useCover } from "./hooks/useCover";
import { useLockedSections } from "./hooks/useLockedSections";
import { useAutoSave, useUnsavedChangesWarning } from "./hooks/useAutoSave";
import { useEditorShortcuts } from "./hooks/useKeyboardShortcuts";
import { useBookState } from "./hooks/useBookState";
import { useQualityValidator } from "./hooks/useQualityValidator";
import { autoFixAllChapters } from "./utils/typographyFixer";
import { TypographyPreset } from "./utils/typographyPresets";
import RichTextEditor from "./components/RichTextEditor";
import CollapsibleSidebar from "./components/CollapsibleSidebar";
import SlimSidebarNav from "./components/SlimSidebarNav";
import BookMindPanel from "./components/BookMindPanel";
import LivePreviewPanel from "./components/LivePreviewPanel";
import LayoutSwitcher, { RightPanelMode } from "./components/LayoutSwitcher";
import ResizableRightPanel from "./components/ResizableRightPanel";
import AutoSaveIndicator from "./components/AutoSaveIndicator";
import { QualityDropdown } from "./components/QualityPanel";
import { WordStatsDropdown } from "./components/WordStatsDropdown";
import ChapterNavDropdown from "./components/ChapterNavDropdown";
import SubscriptionBadge, { SubscriptionBadgeCompact } from "./components/SubscriptionBadge";
import ManageBillingButton from "./components/ManageBillingButton";
import { useWordStats } from "./hooks/useWordStats";
import { useVersionHistory } from "./hooks/useVersionHistory";
import { VersionHistoryPanel, VersionHistoryButton } from "./components/VersionHistoryPanel";
import { useExportHistory } from "./hooks/useExportHistory";
import { ExportHistoryPanel, ExportHistoryButton } from "./components/ExportHistoryPanel";
import SplitPreviewLayout from "./components/SplitPreviewLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import EPUBReaderModal from "./components/EPUBReaderModal";
import UpgradeModal from "./components/UpgradeModal";
import ConfirmDialog from "./components/ConfirmDialog";
import FindReplacePanel from "./components/FindReplacePanel";
import { useFindReplace } from "./hooks/useFindReplace";
import { useOnboarding } from "./hooks/useOnboarding";
import OnboardingTour from "./components/OnboardingTour";
import { loadBookLibrary, saveBookToLibrary } from "./utils/bookLibrary";
// Extracted utilities & components
import { formatRelativeTime, plainText, getContentChapterNumber } from "./utils/pageUtils";
import { ChapterCapsuleMarker } from "./components/ChapterCapsuleMarker";
import { HandleDragIcon } from "./components/HandleDragIcon";
import { MobilePreviewModal, mobileDeviceDimensions } from "./components/MobilePreviewModal";
import { UserDropdownMobile } from "./components/UserDropdownMobile";
// Extracted hooks
import { useEndnotes } from "./hooks/useEndnotes";
import { useSaveBook } from "./hooks/useSaveBook";
import { useDocumentImport } from "./hooks/useDocumentImport";
import { useLibrary } from "./hooks/useLibrary";
import { useCloudSync } from "./hooks/useCloudSync";
import { useFocusMode } from "./hooks/useFocusMode";
import { useTypewriterMode, useParagraphFocus } from "./hooks/useFocusEffects";
import { FocusModePanel, FocusModeButton } from "./components/FocusModePanel";
import { AmbientPlayer } from "./components/AmbientPlayer";

function MakeEbookPage() {
  // Auth context for Supabase user
  const { user, signOut } = useAuth();

  // Check if user has Pro access for Cloud Sync
  const hasCloudSync = useFeatureAccess('cloud_sync');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Next/navigation helpers
  const searchParams = useSearchParams();
  const router = useRouter();

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

  // Find & Replace across all chapters
  const findReplace = useFindReplace(chapters, handleChapterContentChange, handleSelectChapter);

  // Wrap handleRemoveChapter to use the custom confirm dialog
  const handleRemoveChapter = useCallback((idx: number) => {
    handleRemoveChapterRaw(idx, (message, onConfirm) => {
      setDialogState({
        open: true,
        title: 'Delete Chapter',
        message,
        variant: 'destructive',
        confirmLabel: 'Delete',
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, open: false }));
          const deletedChapterId = chapters[idx]?.id;
          onConfirm();
          // Clean up orphaned endnote references pointing to the deleted chapter
          if (deletedChapterId) {
            setEndnoteReferences(prev => prev.filter(ref => ref.chapterId !== deletedChapterId));
          }
        },
      });
    });
  }, [handleRemoveChapterRaw, chapters]);

  // Track previous user state to detect login/logout
  const prevUserRef = useRef(user);
  useEffect(() => {
    // If user was logged in and is now logged out, reset to marketing landing page
    if (prevUserRef.current && !user) {
      setChapters([]);
      setShowMarketingPage(true);
      setCurrentBookId(undefined);
    }
    // If user was logged out and is now logged in, go to editor dashboard
    if (!prevUserRef.current && user) {
      setShowMarketingPage(false);
    }
    prevUserRef.current = user;
  }, [user, setChapters]);

  const {
    tags, setTags, tagInput, setTagInput, handleAddTag, handleRemoveTag
  } = useTags();

  // Cover state and helpers
  const { coverUrl, setCoverUrl, handleCoverChange, clearCover } = useCover(null);

  // Locked sections state
  const { lockedSections, setLockedSections, toggleSection } = useLockedSections();

  const [tab, setTab] = useState<"setup" | "ai" | "preview" | "library">("setup");
  const [sidebarView, setSidebarView] = useState<'library' | 'book' | 'chapters' | 'preview' | null>(null);
  
  // Derived state: panel is open when sidebarView is not null
  const isPanelOpen = sidebarView !== null;

  // Right panel layout mode
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('none');

  // Selected editor text — passed to BookMindPanel for context
  const [selectedEditorText, setSelectedEditorText] = useState<string | undefined>(undefined);
  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      const text = sel?.toString().trim();
      if (text && text.length > 10) setSelectedEditorText(text);
    };
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);
  // Book metadata state (consolidated hook)
  const {
    title, setTitle, author, setAuthor, blurb, setBlurb,
    publisher, setPublisher, pubDate, setPubDate, isbn, setIsbn,
    language, setLanguage, genre, setGenre,
    resetMetadata, loadMetadata,
    currentBookId, setCurrentBookId,
    endnotes, setEndnotes, endnoteReferences, setEndnoteReferences,
    nextEndnoteNumber, setNextEndnoteNumber,
  } = useBookState();

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const isLoadingBookRef = useRef(false);
  // clearEditorState and markClean are defined after hooks that need them; refs break the forward-reference
  const clearEditorStateFnRef = useRef<() => void>(() => {});
  const markCleanFnRef = useRef<() => void>(() => {});

  // Show marketing landing page when no books and user hasn't started editing
  const [showMarketingPage, setShowMarketingPage] = useState(true);

  // EPUB Reader modal state
  const [showEPUBReader, setShowEPUBReader] = useState(false);
  const [epubBlob, setEpubBlob] = useState<Blob | null>(null);

  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileChaptersOpen, setMobileChaptersOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [mobileBookMindOpen, setMobileBookMindOpen] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [newBookConfirmOpen, setNewBookConfirmOpen] = useState(false);
  const [chapterTypeDropdownOpen, setChapterTypeDropdownOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // Generic dialog state for replacing alert()/confirm()
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'confirm' | 'alert' | 'destructive';
    confirmLabel?: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', variant: 'alert', onConfirm: () => {} });

  // Collapsible sidebar sections state
  const [sidebarLibraryExpanded, setSidebarLibraryExpanded] = useState(true);
  const [sidebarPreviewExpanded, setSidebarPreviewExpanded] = useState(false);
  const [sidebarChaptersExpanded, setSidebarChaptersExpanded] = useState(true);
  const [sidebarBookDetailsExpanded, setSidebarBookDetailsExpanded] = useState(false);
  const [showEreaderPreview, setShowEreaderPreview] = useState(false);
  
  // Mobile accordion: only one section open at a time
  const expandMobileSection = (section: 'library' | 'book' | 'chapters' | 'preview') => {
    setSidebarLibraryExpanded(section === 'library' ? !sidebarLibraryExpanded : false);
    setSidebarBookDetailsExpanded(section === 'book' ? !sidebarBookDetailsExpanded : false);
    setSidebarChaptersExpanded(section === 'chapters' ? !sidebarChaptersExpanded : false);
    setSidebarPreviewExpanded(section === 'preview' ? !sidebarPreviewExpanded : false);
  };

  // When a sidebar view is opened, ensure its panel is expanded by default
  useEffect(() => {
    if (!sidebarView) return;
    if (sidebarView === 'library') setSidebarLibraryExpanded(true);
    if (sidebarView === 'book') setSidebarBookDetailsExpanded(true);
    if (sidebarView === 'chapters') setSidebarChaptersExpanded(true);
    if (sidebarView === 'preview') setSidebarPreviewExpanded(true);
  }, [sidebarView]);

  const [saveFeedback, setSaveFeedback] = useState(false);
  const [bookJustLoaded, setBookJustLoaded] = useState(false);
  const [chapterJustAdded, setChapterJustAdded] = useState<string | null>(null);
  
  // Mobile keyboard detection for focus mode
  const [isMobileKeyboardOpen, setIsMobileKeyboardOpen] = useState(false);
  const initialViewportHeight = useRef<number | null>(null);

  // Detect mobile keyboard open/close
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const isMobile = window.matchMedia('(max-width: 1023px)').matches && 'ontouchstart' in window;
    if (!isMobile) return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    if (initialViewportHeight.current === null) {
      initialViewportHeight.current = viewport.height;
    }

    const handleResize = () => {
      if (initialViewportHeight.current === null) return;
      const heightDiff = initialViewportHeight.current - viewport.height;
      setIsMobileKeyboardOpen(heightDiff > 150);
    };

    viewport.addEventListener('resize', handleResize);
    return () => viewport.removeEventListener('resize', handleResize);
  }, []);
  
  // Split preview state (inside main) — off by default; right panel LayoutSwitcher is preferred
  const [isSplitPreviewEnabled, setIsSplitPreviewEnabled] = useState(false);

  // Onboarding tour
  const onboarding = useOnboarding({
    userId: user?.id,
    stepCallbacks: {
      'book-details': () => setSidebarView('book'),
      'chapters': () => setSidebarView('chapters'),
      'editor': () => setSidebarView(null),
      'preview': () => {
        setSidebarView(null);
        setIsSplitPreviewEnabled(true);
      },
      'export': () => setSidebarView('book'),
      'auto-save': () => setSidebarView(null),
      'mobile-menu': () => {},
      'mobile-editor': () => setMobileSidebarOpen(false),
      'mobile-preview': () => setMobileSidebarOpen(false),
    },
  });

  // Typography preset for EPUB export
  const [typographyPreset, setTypographyPreset] = useState<TypographyPreset>('default');

  // Quality validator hook
  const { issues: qualityIssues, score: qualityScore, autoFixableCount } = useQualityValidator({
    chapters,
    title,
    author,
    coverFile: coverUrl,
  });

  // Word stats hook
  const { bookStats, sessionStats } = useWordStats(chapters, user?.id);

  // Version history hook
  const { 
    versions, 
    saveVersion, 
    deleteVersion, 
    clearHistory, 
    formatTimestamp,
    hasVersions 
  } = useVersionHistory({ bookId: currentBookId, userId: user?.id });

  // State for version history panel visibility
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Export history hook
  const {
    exports: exportHistory,
    isLoading: exportHistoryLoading,
    saveExport,
    getExportBlob,
    deleteExport,
    clearHistory: clearExportHistory,
  } = useExportHistory({ bookId: currentBookId, maxExports: 5 });

  // State for export history panel visibility
  const [showExportHistory, setShowExportHistory] = useState(false);

  // ── Extracted hooks ────────────────────────────────────────────────────────
  const cloudSync = useCloudSync({ user, isLoadingBookRef, setLibraryBooks });

  const endnotesHook = useEndnotes({
    chapters, setChapters,
    endnotes, setEndnotes,
    endnoteReferences, setEndnoteReferences,
    nextEndnoteNumber, setNextEndnoteNumber,
    selectedChapter, setSelectedChapter,
    setDialogState,
  });

  const docImport = useDocumentImport({
    resetMetadata, setTitle, setAuthor,
    setChapters, setSelectedChapter, setTags,
    clearCover, setSidebarView,
  });

  const library = useLibrary({
    libraryBooks, setLibraryBooks,
    user, hasCloudSync, currentBookId, isLoadingBookRef,
    setShowMarketingPage, loadMetadata,
    setTags, setCoverUrl, setChapters, setEndnoteReferences,
    setEndnotes, setNextEndnoteNumber, setCurrentBookId,
    setSelectedChapter, setMobileSidebarOpen, setSidebarView,
    setBookJustLoaded, setDialogState,
    clearEditorState: () => clearEditorStateFnRef.current(),
  });

  const saveBook = useSaveBook({
    title, author, blurb, publisher, pubDate, isbn, language, genre, tags,
    chapters, setChapters, setEndnoteReferences,
    coverUrl, endnotes, endnoteReferences,
    currentBookId, setCurrentBookId,
    user, hasCloudSync,
    saveVersion, saveExport, exportHistory, getExportBlob, typographyPreset,
    setDialogState, setLibraryBooks, setSaveFeedback,
    setSaveDialogOpen, newBookConfirmOpen, setNewBookConfirmOpen,
    setEpubBlob, setShowEPUBReader, setShowExportHistory,
    markClean: () => markCleanFnRef.current(),
    clearEditorState: () => clearEditorStateFnRef.current(),
  });
  // Focus mode
  const focus = useFocusMode();
  useTypewriterMode(focus.active && focus.settings.typewriterMode);
  useParagraphFocus(focus.active && focus.settings.paragraphFocus);

  // Close sidebar and live preview when focus mode activates with hideChrome on
  useEffect(() => {
    if (focus.active && focus.settings.hideChrome) {
      setSidebarView(null);
      setIsSplitPreviewEnabled(false);
    }
  }, [focus.active, focus.settings.hideChrome]);
  // ──────────────────────────────────────────────────────────────────────────

  // Auto-save hook - Creates draft book if needed to prevent data loss
  const handleAutoSave = useCallback(() => {
    // Auto-save will create a draft book if one doesn't exist
    // This prevents data loss when users click away before manually saving
    saveBook.saveBookDirectly(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBookId, title, author, blurb, publisher, pubDate, isbn, language, genre, tags, chapters, coverUrl, endnoteReferences]);

  // Helper to determine if there's meaningful content to auto-save
  const hasContent = (title && title.trim() !== '') ||
                     (author && author.trim() !== '') ||
                     chapters.length > 0;

  const { isDirty, isSaving, lastSaved, markDirty, markClean } = useAutoSave({
    onSave: handleAutoSave,
    interval: 30000, // 30 seconds
    enabled: hasContent, // Enable auto-save as soon as user enters any data
  });
  // Wire up the ref so useSaveBook gets the real markClean
  markCleanFnRef.current = markClean;

  // Warn before leaving with unsaved changes
  useUnsavedChangesWarning(isDirty);

  // Keyboard shortcuts
  useEditorShortcuts({
    onSave: () => {
      saveBook.handleSaveBook();
    },
    onExport: () => {
      saveBook.handleExportEPUB();
    },
    onPreview: () => {
      setIsSplitPreviewEnabled(prev => !prev);
    },
    onNewChapter: () => {
      handleAddChapter('content', '');
    },
    onFindReplace: () => {
      findReplace.isOpen ? findReplace.close() : findReplace.open();
    },
    enabled: chapters.length > 0,
  });

  // Mark dirty on content changes (skip when loading a book from library/Supabase)
  useEffect(() => {
    if (initialized && chapters.length > 0 && !isLoadingBookRef.current) {
      markDirty();
    }
  }, [chapters, title, author, blurb, publisher, pubDate, genre, tags, coverUrl]);

  // Auto-fix typography handler
  const handleAutoFixTypography = useCallback(() => {
    const { fixedChapters, totalChanges } = autoFixAllChapters(chapters);
    if (totalChanges > 0) {
      setChapters(fixedChapters as Chapter[]);
      setDialogState({
        open: true,
        title: 'Typography Fixed',
        message: `Fixed ${totalChanges} typography issue${totalChanges === 1 ? '' : 's'} across all chapters.`,
        variant: 'alert',
        onConfirm: () => setDialogState(prev => ({ ...prev, open: false })),
      });
    } else {
      setDialogState({
        open: true,
        title: 'No Issues Found',
        message: 'No typography issues found to fix.',
        variant: 'alert',
        onConfirm: () => setDialogState(prev => ({ ...prev, open: false })),
      });
    }
  }, [chapters, setChapters]);

  // Navigate to chapter from quality issue
  const handleNavigateToChapterFromIssue = useCallback((chapterId: string) => {
    const chapterIndex = chapters.findIndex(ch => ch.id === chapterId);
    if (chapterIndex >= 0) {
      setSelectedChapter(chapterIndex);
    }
  }, [chapters, setSelectedChapter]);

  // Toggle chapter locked state
  const handleToggleChapterLock = useCallback((index: number) => {
    setChapters(prev => prev.map((ch, i) => i === index ? { ...ch, locked: !ch.locked } : ch));
  }, [setChapters]);

  // Restore a version from history
  const handleRestoreVersion = useCallback((restoredChapters: Chapter[], metadata: { blurb?: string; publisher?: string; pubDate?: string; genre?: string; tags?: string[] }) => {
    setDialogState({
      open: true,
      title: 'Restore Version',
      message: 'Restore this version? Your current work will be replaced.',
      variant: 'destructive',
      confirmLabel: 'Restore',
      onConfirm: () => {
        setDialogState(prev => ({ ...prev, open: false }));
        setChapters(restoredChapters);
        if (metadata.blurb) setBlurb(metadata.blurb);
        if (metadata.publisher) setPublisher(metadata.publisher);
        if (metadata.pubDate) setPubDate(metadata.pubDate);
        if (metadata.genre) setGenre(metadata.genre);
        if (metadata.tags) setTags(metadata.tags);
        setSelectedChapter(0);
        setShowVersionHistory(false);
        markDirty();
      },
    });
  }, [setChapters, setBlurb, setPublisher, setPubDate, setGenre, setTags, setSelectedChapter, markDirty]);

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

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setChapterTypeDropdownOpen(false);
      }
    }
    if (chapterTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
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
        id: `chapter-${Date.now()}`,
        title: "",
        content: "",
        type: "content",
      },
    ]);
    setSelectedChapter(0);
    setSidebarView('book');

    // Trigger onboarding tour for first-time users
    if (!onboarding.isOnboardingComplete) {
      setTimeout(() => onboarding.startTour(), 800);
    }
  }
  // Wire up the ref so hooks that received () => clearEditorStateFnRef.current() get the real fn
  clearEditorStateFnRef.current = clearEditorState;

  function handleNewBookConfirm() {
    // Save current book before starting new one
    if (title || author || chapters.some(ch => ch.content.trim())) {
      // Save first, then clear editor state in the callback
      saveForNewBook();
    } else {
      // No content to save, just clear and start new
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  function saveForNewBook() {
    // If there's already a book ID and it exists in library, show save dialog
    if (currentBookId) {
      const library = loadBookLibrary();
      const existingBook = library.find((b: any) => b.id === currentBookId);
      if (existingBook) {
        setSaveDialogOpen(true);
        return;
      }
    }
    
    // No existing book, save and then clear
    saveBook.saveBookDirectly(false);
    saveBook.saveVersionSnapshot();
    clearEditorState();
    setNewBookConfirmOpen(false);
  }

  function handleNewBook() {
    // Legacy function for backwards compatibility
    setShowMarketingPage(false); // Dismiss marketing page when starting a new book
    handleNewBookConfirm();
  }
  
  function handleStartWriting() {
    // Called from marketing page when user wants to enter the editor
    setShowMarketingPage(false);
    if (libraryBooks.length > 0) {
      // If they have books, load the most recent one
      const mostRecent = libraryBooks.reduce((a, b) => (a.savedAt > b.savedAt ? a : b));
      library.handleLoadBook(mostRecent.id);
    } else {
      // Otherwise start a new book
      clearEditorState();
    }
  }

  function handleGoToHome() {
    // Clear current book and show landing page
    setChapters([]);
    setTitle("");
    setAuthor("");
    setCurrentBookId(undefined);
    setSelectedChapter(0);
    setSidebarView(null); // Close any open panels
  }

  useEffect(() => {
    const books = loadBookLibrary(user?.id ?? '');
    setLibraryBooks(books);

  const loadBookId = searchParams ? searchParams.get('load') : null;
    if (loadBookId) {
      const bookToLoad = books.find(book => book.id === loadBookId);
      if (bookToLoad) {
        setShowMarketingPage(false); // Dismiss marketing page when loading a book
        library.handleLoadBook(loadBookId);
        router.replace('/make-ebook', { scroll: false });
        setInitialized(true);
        return;
      } else {
        router.replace('/make-ebook', { scroll: false });
        if (!initialized) setInitialized(true);
        return;
      }
    }

    // Don't auto-load books on initial visit - let marketing page show first
    // Only set initialized to true so we don't keep re-running this effect
    if (!initialized) setInitialized(true);
  }, [searchParams, initialized, currentBookId, chapters.length]);

  // Scroll indicator effect for mobile sidebar
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const hasMoreContent = scrollTop + clientHeight < scrollHeight - 10; // 10px threshold
        setShowScrollIndicator(hasMoreContent);
      }
    };

    const container = scrollContainerRef.current;
    if (container && mobileSidebarOpen) {
      // Check initially
      handleScroll();
      // Add scroll listener
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [mobileSidebarOpen, tab]); // Re-check when tab changes as content changes

  const totalWords = chapters.reduce(
    (sum, ch) => sum + (plainText(ch.content).split(/\s+/).filter(Boolean).length || 0),
    0
  );
  const pageCount = Math.max(1, Math.ceil(totalWords / 300));
  const readingTime = Math.max(1, Math.round(totalWords / 200));

  // Show marketing landing page for visitors (before they start editing)
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
      {/* Main Content - Full height without header */}
      <div className="bg-white dark:bg-[#0a0a0a] text-[#15161a] dark:text-[#e5e5e5]">
        
        {/* New Book Confirmation Dialog */}
        {newBookConfirmOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0a0a0a] rounded shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Start New Book?</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This will save your current book and start a new one. All your current work will be preserved in the library.
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
                  className="flex-1 px-4 py-2 rounded bg-[#181a1d] dark:bg-[#1a1a1a] text-white text-sm font-medium hover:bg-[#23252a] dark:hover:bg-[#3a3a3a] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Dialog */}
        {saveDialogOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0a0a0a] rounded shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Save Book</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This book already exists in your library. Do you want to overwrite the existing version or save as a new version?
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
                  className="flex-1 px-4 py-2 rounded bg-[#181a1d] dark:bg-[#1a1a1a] text-white text-sm font-medium hover:bg-[#23252a] dark:hover:bg-[#3a3a3a] transition-colors"
                >
                  Save as New
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Document Dialog */}
        {docImport.importDialogOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Import Document</h2>
                <button
                  onClick={() => docImport.setImportDialogOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Upload a document to automatically parse chapters and create a new book.
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
                  <svg className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>

                <button
                  onClick={() => docImport.importFileInputRef.current?.click()}
                  disabled={docImport.importing}
                  className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {docImport.importing ? 'Importing...' : 'Choose File'}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Supported: .txt, .doc, .docx, .pdf
                </p>
              </div>

              {docImport.importError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{docImport.importError}</p>
                </div>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>• Chapters are detected by headings like "Chapter 1", "Prologue", etc.</p>
                <p>• The document title will be extracted if possible</p>
                <p>• You can edit all details after import</p>
              </div>
            </div>
          </div>
        )}

        {/* Version History Panel */}
        {showVersionHistory && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Version History</h2>
                <button
                  onClick={() => setShowVersionHistory(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <VersionHistoryPanel
                  versions={versions}
                  currentWordCount={bookStats.totalWords}
                  onRestoreAction={handleRestoreVersion}
                  onDeleteAction={deleteVersion}
                  onClearAllAction={clearHistory}
                />
              </div>
            </div>
          </div>
        )}

        {/* Export History Panel */}
        {showExportHistory && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333]">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Export History</h2>
                <button
                  onClick={() => setShowExportHistory(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ExportHistoryPanel
                  exports={exportHistory}
                  isLoading={exportHistoryLoading}
                  onPreviewAction={saveBook.handlePreviewExport}
                  onDownloadAction={saveBook.handleDownloadExport}
                  onDeleteAction={deleteExport}
                  onClearAllAction={clearExportHistory}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Preview Modal — mirrors desktop SplitPreviewLayout */}
        {mobilePreviewOpen && (
          <MobilePreviewModal
            chapters={chapters}
            selectedChapter={selectedChapter}
            onChapterSelect={setSelectedChapter}
            onClose={() => setMobilePreviewOpen(false)}
          />
        )}

        {/* Mobile Book Mind Drawer — full-screen, lg:hidden */}
        {mobileBookMindOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col animate-slide-in-from-bottom bg-white dark:bg-[#0a0a0a]">
            <BookMindPanel
              bookId={currentBookId}
              userId={user?.id}
              title={title}
              author={author}
              genre={genre}
              chapters={chapters.map(c => ({ title: c.title, content: c.content, type: c.type }))}
              selectedChapterIndex={selectedChapter}
              selectedText={selectedEditorText}
              onClose={() => setMobileBookMindOpen(false)}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        <div className={`fixed top-0 left-0 right-0 bottom-0 z-[100] lg:hidden transition-[visibility] duration-200 ease-out ${
          mobileSidebarOpen ? 'visible' : 'invisible'
        }`}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ease-out ${
              mobileSidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Sidebar Panel */}
          <div className={`absolute top-0 left-0 h-full w-full bg-white dark:bg-[#0a0a0a] shadow-2xl transform transition-transform duration-200 ease-out ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              
              {/* Logo Header - Sticky */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between pr-0">
                  <button
                    onClick={() => {
                      handleGoToHome();
                      setMobileSidebarOpen(false);
                    }}
                    className="hover:opacity-70 transition-opacity ml-2"
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
                    <img src="/close-sidebar-icon.svg" alt="Close" className="w-5 h-5 dark:invert" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500">
                
                {/* Note: All sections use same collapsible pattern as desktop */}
                <div className="px-4 space-y-2 py-2">
                  
                  {/* Library Section */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <button
                      onClick={() => expandMobileSection('library')}
                      className="flex items-center justify-between py-2 w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 text-[#050505] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <rect x="4" y="4" width="3" height="16" rx="0.5" />
                          <rect x="10" y="7" width="3" height="13" rx="0.5" />
                          <rect x="16" y="5" width="3" height="15" rx="0.5" />
                          <path d="M3 20h18" />
                        </svg>
                        <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Library</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">({libraryBooks.length})</span>
                      </div>
                      {sidebarLibraryExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {sidebarLibraryExpanded && (
                      <>
                        {/* Action buttons */}
                        <div className="flex items-center gap-1 pb-2 mb-1 border-b border-gray-100 dark:border-gray-800">
                          {libraryBooks.length > 0 && (
                            <button
                              onClick={() => {
                                library.setMultiSelectMode(!library.multiSelectMode);
                                if (library.multiSelectMode) library.setSelectedBookIds(new Set());
                              }}
                              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors ${library.multiSelectMode ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'}`}
                              title={library.multiSelectMode ? "Cancel selection" : "Select multiple"}
                            >
                              <svg className={`w-4 h-4 ${library.multiSelectMode ? 'text-blue-600 dark:text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                <circle className={library.multiSelectMode ? '' : 'dark:stroke-white'} cx="12" cy="12" r="9" />
                                <path className={library.multiSelectMode ? '' : 'dark:stroke-white'} d="M8.5 12l2.5 2.5 4.5-4.5" />
                              </svg>
                              <span className={`text-[10px] font-medium ${library.multiSelectMode ? 'text-blue-600 dark:text-blue-400' : 'text-[#050505] dark:text-[#e5e5e5]'}`}>
                                {library.multiSelectMode ? 'Cancel' : 'Select'}
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
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                              <path className="dark:stroke-white" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <path className="dark:stroke-white" d="M14 2v6h6" />
                              <path className="dark:stroke-white" d="M9 14h6M12 11v6" />
                            </svg>
                            <span className="text-[10px] font-medium text-[#050505] dark:text-[#e5e5e5]">New</span>
                          </button>
                          <button
                            onClick={() => {
                              docImport.showImportDialog();
                              setMobileSidebarOpen(false);
                            }}
                            className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                            title="Import document"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                              <path className="dark:stroke-white" d="M12 3v12M7.5 10l4.5 5 4.5-5" />
                              <path className="dark:stroke-white" d="M4 19h16" />
                            </svg>
                            <span className="text-[10px] font-medium text-[#050505] dark:text-[#e5e5e5]">Import</span>
                          </button>
                        </div>
                        {library.multiSelectMode && libraryBooks.length > 0 && (
                          <div className="flex items-center justify-between mt-2 px-2 py-1.5 bg-gray-50 dark:bg-[#1a1a1a] rounded-md">
                            <button
                              onClick={library.toggleSelectAll}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {library.selectedBookIds.size === libraryBooks.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {library.selectedBookIds.size} selected
                            </span>
                            <button
                              onClick={library.handleDeleteSelectedBooks}
                              disabled={library.selectedBookIds.size === 0}
                              className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Delete Selected
                            </button>
                          </div>
                        )}
                        <div className="mt-2 space-y-1 pl-2">
                        {libraryBooks.length === 0 ? (
                          <div className="text-xs text-gray-600 dark:text-gray-400 py-4 px-2 text-center">
                            No saved books yet
                          </div>
                        ) : (
                          libraryBooks.map((book) => {
                            const isSelected = selectedBookId === book.id;
                            const isChecked = library.selectedBookIds.has(book.id);
                            return (
                              <div
                                key={book.id}
                                className={`group flex items-center justify-between py-2 px-2 rounded transition-colors ${
                                  isSelected || isChecked
                                    ? 'bg-gray-100 dark:bg-[#1a1a1a]'
                                    : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                                }`}
                              >
                                {library.multiSelectMode && (
                                  <label className="flex items-center mr-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => library.toggleBookSelection(book.id)}
                                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                                    />
                                  </label>
                                )}
                                <button
                                  onClick={() => library.multiSelectMode ? library.toggleBookSelection(book.id) : setSelectedBookId(isSelected ? null : book.id)}
                                  className="flex-1 text-left"
                                >
                                  <div className={`text-sm font-medium truncate ${
                                    isSelected || isChecked
                                      ? 'text-gray-900 dark:text-gray-100'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {book.title || 'Untitled'}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {book.author || 'Unknown'}
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
                                      Load
                                    </button>
                                    <button
                                      onClick={() => library.handleExportLibraryBook(book.id)}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded"
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
                                      onClick={() => library.handleDeleteBook(book.id)}
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
                    )}
                  </div>

                  {/* Book Details Section */}
                  <div className={`border-b border-gray-200 dark:border-gray-700 pb-2 transition-colors duration-1000 ease-out ${
                    bookJustLoaded ? 'bg-gray-100/80 dark:bg-gray-700/20' : ''
                  }`}>
                    <button
                      onClick={() => expandMobileSection('book')}
                      className="flex items-center justify-between py-2 w-full text-left"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg className="w-5 h-5 flex-shrink-0 text-[#050505] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          <path d="M8 7h8M8 11h8M8 15h5" />
                        </svg>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Book</span>
                          {title && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {title}
                            </span>
                          )}
                        </div>
                      </div>
                      {sidebarBookDetailsExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {sidebarBookDetailsExpanded && (
                      <div className="mt-2 space-y-3 pl-2 pr-2">
                        {/* Action buttons row */}
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                          <button
                            onClick={() => saveBook.handleSaveBook()}
                            disabled={!!saveFeedback}
                            className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-60"
                            title={saveFeedback ? "Saved!" : "Save book"}
                          >
                            {saveFeedback ? (
                              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <SaveIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                            )}
                            <span className={`text-xs font-medium ${saveFeedback ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {saveFeedback ? 'Saved!' : 'Save'}
                            </span>
                          </button>
                          <button
                            onClick={() => saveBook.handleExportEPUB()}
                            className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                            title="Export as EPUB"
                          >
                            <DownloadIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">EPUB</span>
                          </button>
                          <button
                            onClick={saveBook.handleExportPDF}
                            className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                            title="Export as PDF"
                          >
                            <DownloadIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">PDF</span>
                          </button>
                          {exportHistory.length > 0 && (
                            <ExportHistoryButton
                              exportCount={exportHistory.length}
                              onClickAction={() => setShowExportHistory(true)}
                            />
                          )}
                        </div>
                        {/* Title */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Title</label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="Book title"
                          />
                        </div>
                        
                        {/* Author */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Author</label>
                          <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="Author name"
                          />
                        </div>
                        
                        {/* Blurb */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Description</label>
                          <textarea
                            value={blurb}
                            onChange={(e) => setBlurb(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5] resize-none"
                            placeholder="Brief description"
                            rows={3}
                          />
                        </div>
                        
                        {/* Publisher */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Publisher</label>
                          <input
                            type="text"
                            value={publisher}
                            onChange={(e) => setPublisher(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="Publisher name"
                          />
                        </div>
                        
                        {/* Publication Date */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Publication Date</label>
                          <input
                            type="date"
                            value={pubDate}
                            onChange={(e) => setPubDate(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                          />
                        </div>
                        
                        {/* Language */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                          >
                            {LANGUAGES.map((lang) => (
                              <option key={lang} value={lang}>
                                {lang}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Genre */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Genre</label>
                          <input
                            type="text"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="e.g. Fiction, Mystery"
                          />
                        </div>
                        
                        {/* ISBN */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">ISBN</label>
                          <input
                            type="text"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            disabled={lockedSections.bookInfo}
                            className="w-full px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                            placeholder="ISBN number"
                          />
                        </div>
                        
                        {/* Tags */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Tags</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                              disabled={lockedSections.bookInfo}
                              className="flex-1 px-3 py-2 text-sm rounded bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white outline-none disabled:opacity-60 disabled:cursor-not-allowed text-[#050505] dark:text-[#e5e5e5]"
                              placeholder="e.g., fiction, thriller, mystery, romance"
                            />
                            <button
                              onClick={handleAddTag}
                              disabled={lockedSections.bookInfo}
                              className="px-3 py-2 rounded bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                              <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                            </button>
                          </div>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-[#1a1a1a] text-[#050505] dark:text-[#e5e5e5]"
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
                        
                        {/* Cover Image */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Cover Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            disabled={lockedSections.bookInfo}
                            className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-[#2a2a2a] file:text-[#050505] dark:file:text-[#e5e5e5] hover:file:bg-gray-200 dark:hover:file:bg-[#3a3a3a] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                          {coverUrl && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Cover uploaded</p>
                          )}
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => {
                                const params = new URLSearchParams({
                                  title: title || '',
                                  author: author || ''
                                }).toString();
                                window.open(`https://coverly.figma.site?${params}`, '_blank', 'noopener,noreferrer');
                              }}
                              className="group relative w-full overflow-hidden rounded-xl p-[1px] transition-all hover:scale-[1.02] active:scale-[0.98]"
                              title="Create a professional book cover with Coverly"
                            >
                              {/* Gradient border */}
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                              
                              {/* Inner content */}
                              <div className="relative flex items-center gap-3 rounded-xl bg-white dark:bg-[#0a0a0a] px-3 py-3">
                                {/* Example cover thumbnail */}
                                <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden shadow-md ring-1 ring-black/10 dark:ring-white/10 group-hover:shadow-lg transition-shadow">
                                  <img
                                    src="/coverly-preview.png"
                                    alt="Example cover made with Coverly"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                
                                {/* Text content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Need a cover?</p>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 uppercase">
                                      Free
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">Design a professional cover in minutes</p>
                                  
                                  {/* CTA */}
                                  <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:gap-1.5 transition-all">
                                    <span>Open Coverly</span>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chapters Section */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <button
                      onClick={() => expandMobileSection('chapters')}
                      className="flex items-center justify-between py-2 w-full text-left"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg className="w-5 h-5 flex-shrink-0 text-[#050505] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                          <path d="M16 13H8M16 17H8M10 9H8" />
                        </svg>
                        <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Chapters</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">({chapters.length})</span>
                      </div>
                      {sidebarChaptersExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {sidebarChaptersExpanded && (
                      <div className="mt-1 space-y-1">
                        {/* Add chapter button */}
                        <div className="flex items-center gap-1 pb-2 mb-1 border-b border-gray-100 dark:border-gray-800">
                          <div className="relative">
                            <button
                              onClick={() => setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)}
                              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                              title="Add chapter"
                            >
                              <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Add</span>
                            </button>

                            {chapterTypeDropdownOpen && (
                              <div ref={dropdownRef} className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-[#0a0a0a] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-2 max-h-96 overflow-y-auto">
                                <div className="space-y-3 px-2">
                                  {/* Front Matter */}
                                  <div>
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                      Front Matter
                                    </div>
                                    {CHAPTER_TEMPLATES.frontmatter.map((template) => (
                                      <button
                                        key={template.title}
                                        onClick={() => {
                                          const newChapterId = handleAddChapter('frontmatter', template.title === 'Custom Front Matter' ? '' : template.title);
                                          setChapterTypeDropdownOpen(false);
                                          setSidebarChaptersExpanded(true);
                                          setChapterJustAdded(newChapterId);
                                          setTimeout(() => setChapterJustAdded(null), 1000);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                                      >
                                        {template.title}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Main Content */}
                                  <div>
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                      Main Content
                                    </div>
                                    {CHAPTER_TEMPLATES.content.map((template) => (
                                      <button
                                        key={template.title}
                                        onClick={() => {
                                          const newChapterId = handleAddChapter('content', template.title === 'Custom Chapter' ? '' : template.title);
                                          setChapterTypeDropdownOpen(false);
                                          setSidebarChaptersExpanded(true);
                                          setChapterJustAdded(newChapterId);
                                          setTimeout(() => setChapterJustAdded(null), 1000);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                                      >
                                        {template.title}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Back Matter */}
                                  <div>
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                      Back Matter
                                    </div>
                                    {CHAPTER_TEMPLATES.backmatter.map((template) => (
                                      <button
                                        key={template.title}
                                        onClick={() => {
                                          const newChapterId = handleAddChapter('backmatter', template.title === 'Custom Back Matter' ? '' : template.title);
                                          setChapterTypeDropdownOpen(false);
                                          setSidebarChaptersExpanded(true);
                                          setChapterJustAdded(newChapterId);
                                          setTimeout(() => setChapterJustAdded(null), 1000);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm text-[#050505] dark:text-[#e5e5e5]"
                                      >
                                        {template.title}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400 px-2 mb-1">Drag to reorder</p>
                        {chapters.map((ch, i) => {
                          const isSelected = selectedChapter === i;
                          const titleText = ch.title?.trim() || 'Title';
                          
                          const getChapterInfo = () => {
                            if (ch.type === 'frontmatter') {
                              return {
                                typeLabel: 'Frontmatter',
                                title: titleText && titleText !== 'Title' ? titleText : 'Title'
                              };
                            }
                            if (ch.type === 'backmatter') {
                              return {
                                typeLabel: 'Backmatter',
                                title: titleText && titleText !== 'Title' ? titleText : 'Title'
                              };
                            }
                            const contentChapterNum = getContentChapterNumber(chapters, i);
                            return {
                              typeLabel: `Chapter ${contentChapterNum}`,
                              title: titleText && titleText !== 'Title' ? titleText : 'Title'
                            };
                          };

                          const { typeLabel, title: chapterTitle } = getChapterInfo();
                          const isJustAdded = chapterJustAdded === ch.id;
                          
                          return (
                            <div
                              key={ch.id}
                              className={`group flex items-center gap-2 px-2 py-2 rounded text-sm cursor-pointer select-none transition-all duration-1000 ease-out ${
                                dragOverIndex === i
                                  ? 'border-2 border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                                  : isSelected
                                    ? 'bg-gray-100 dark:bg-[#1a1a1a] border border-transparent'
                                    : isJustAdded
                                      ? 'bg-gray-100/80 dark:bg-gray-700/20 border border-transparent'
                                      : 'border border-transparent hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                              }`}
                              style={{
                                opacity: dragItemIndex === i && ghostPillPosition.visible ? 0.3 : 1,
                              } as React.CSSProperties}
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
                                <span className={`text-[10px] ${isSelected ? 'text-gray-400 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                                  {typeLabel}
                                </span>
                                <span className={`text-sm truncate ${isSelected ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                  {chapterTitle}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {/* Edit button - Mobile only */}
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
                                {/* Lock button */}
                                <button
                                  className={`transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded ${ch.locked ? 'opacity-100 text-gray-600 dark:text-gray-300' : 'opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleChapterLock(i);
                                  }}
                                  aria-label={ch.locked ? 'Unlock chapter' : 'Lock chapter'}
                                  title={ch.locked ? 'Unlock chapter' : 'Mark complete and lock'}
                                >
                                  {ch.locked ? (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                      <path d="M7 11V7a5 5 0 0 1 10 0"/>
                                    </svg>
                                  )}
                                </button>
                                {/* Delete button — hidden when locked */}
                                {chapters.length > 1 && !ch.locked && (
                                  <button
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded text-gray-600 dark:text-gray-400"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveChapter(i);
                                    }}
                                    aria-label="Delete chapter"
                                  >
                                    <BinIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Preview Section */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    <button
                      onClick={() => expandMobileSection('preview')}
                      className="flex items-center justify-between py-2 w-full text-left"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img src="/summary-icon.svg" alt="Preview" className="w-5 h-5 dark:invert flex-shrink-0" />
                        <span className="text-sm font-semibold text-[#050505] dark:text-[#e5e5e5]">Preview</span>
                      </div>
                      {sidebarPreviewExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {sidebarPreviewExpanded && (
                      <div className="mt-2 px-2">
                        {/* Cover Preview */}
                        <div className="mb-4 flex justify-center">
                          <div className="w-32 h-48 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt="Book cover"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img src="/preview-icon.svg" alt="No cover" className="w-8 h-8 opacity-40 dark:invert" />
                            )}
                          </div>
                        </div>
                        
                        {/* Book Info */}
                        <div className="space-y-2 text-sm">
                          <div>
                            <div className="text-xs text-gray-700 dark:text-gray-400 mb-1">Title</div>
                            <div className="font-medium text-[#050505] dark:text-[#e5e5e5]">{title || 'Untitled'}</div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-700 dark:text-gray-400 mb-1">Author</div>
                            <div className="text-[#050505] dark:text-[#e5e5e5]">{author || 'Unknown'}</div>
                          </div>
                          
                          {pubDate && (
                            <div>
                              <div className="text-xs text-gray-700 dark:text-gray-400 mb-1">Publication Date</div>
                              <div className="text-[#050505] dark:text-[#e5e5e5]">{new Date(pubDate).toLocaleDateString()}</div>
                            </div>
                          )}
                          
                          {language && (
                            <div>
                              <div className="text-xs text-gray-700 dark:text-gray-400 mb-1">Language</div>
                              <div className="flex items-center gap-2">
                                <img src="/dark-languages-icon.svg" className="w-4 h-4 hidden dark:block" alt="" />
                                <img src="/languages-icon.svg" className="w-4 h-4 dark:hidden" alt="" />
                                <span className="text-[#050505] dark:text-[#e5e5e5]">{language}</span>
                              </div>
                            </div>
                          )}
                          
                          {genre && (
                            <div>
                              <div className="text-xs text-gray-700 dark:text-gray-400 mb-1">Genre</div>
                              <div className="text-[#050505] dark:text-[#e5e5e5]">{genre}</div>
                            </div>
                          )}
                          
                          {tags.length > 0 && (
                            <div>
                              <div className="text-xs text-gray-700 dark:text-gray-400 mb-1">Tags</div>
                              <div className="flex flex-wrap gap-1">
                                {tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-block px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-[#1a1a1a] text-[#050505] dark:text-[#e5e5e5]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Stats */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-400">Chapters</span>
                            <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">{chapters.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-400">Words</span>
                            <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">{totalWords.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-400">Pages</span>
                            <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">{pageCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-400">Reading Time</span>
                            <span className="font-medium text-[#050505] dark:text-[#e5e5e5]">
                              {readingTime} {readingTime === 1 ? 'minute' : 'minutes'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Book Mind */}
                  {currentBookId && (
                    <div className="pt-2">
                      <Link
                        href={`/make-ebook/book-mind?book=${currentBookId}`}
                        onClick={() => setMobileSidebarOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-[#050505] dark:text-[#e5e5e5]">Book Mind</span>
                      </Link>
                    </div>
                  )}

                </div>
              </div>

              {/* Footer - Compact */}
              <footer className="flex-shrink-0 pt-3 pb-3 px-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] space-y-2.5">
                {/* User Account Row */}
                {user ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <SubscriptionBadge showUpgradeButton={false} />
                      <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate min-w-0 flex-1">{user.email}</span>
                      <ThemeToggle />
                    </div>
                    <div className="flex items-center justify-between">
                      <ManageBillingButton variant="ghost" size="sm" className="h-auto p-0 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
                      <button
                        onClick={async () => {
                          await signOut();
                          setMobileSidebarOpen(false);
                        }}
                        className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <Link
                      href="/login"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      Log in
                    </Link>
                    <ThemeToggle />
                  </div>
                )}

                {/* Links Row — extra spacing from account section */}
                <div className="pt-2" />
                <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <button
                    onClick={() => {
                      setMobileSidebarOpen(false);
                      onboarding.resetOnboarding();
                      if (chapters.length === 0) {
                        clearEditorState();
                      }
                      setTimeout(() => onboarding.startTour(), chapters.length === 0 ? 800 : 400);
                    }}
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Tour</span>
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <a href="https://neilmcardle.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Terms</a>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <a href="https://neilmcardle.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacy</a>
                </div>

                {/* Copyright */}
                <div className="text-center text-[10px] text-gray-400 dark:text-gray-500">© 2026 Neil McArdle</div>
              </footer>
            </div>
          </div>
        </div>

        {/* Mobile Chapters Panel */}
        <div className={`fixed top-0 right-0 bottom-0 z-[100] lg:hidden transition-[visibility] duration-200 ease-out ${
          mobileChaptersOpen ? 'visible' : 'invisible'
        }`} style={{ left: 0 }}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ease-out ${
              mobileChaptersOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setMobileChaptersOpen(false)}
          />
          {/* Chapters Panel */}
          <div className={`absolute top-0 right-0 h-full w-full bg-white dark:bg-[#0a0a0a] shadow-2xl transform transition-transform duration-200 ease-out ${
            mobileChaptersOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 text-[#050505] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8M16 17H8M10 9H8" />
                  </svg>
                  <h3 className="text-sm font-bold text-[#050505] dark:text-[#e5e5e5]">Chapters list</h3>
                </div>
                <button
                  onClick={() => setMobileChaptersOpen(false)}
                  className="flex items-center justify-center px-5 py-4 rounded-full bg-white dark:bg-[#0a0a0a] gap-2 focus:outline-none transition-opacity relative"
                  aria-label="Close chapters menu"
                  style={{ minWidth: 56, minHeight: 56 }}
                >
                  <span className="absolute inset-0" style={{ zIndex: 1 }}></span>
                  <img alt="Close" loading="lazy" width="28" height="28" decoding="async" data-nimg="1" className="w-5 h-5 dark:invert" style={{ color: 'transparent', zIndex: 2 }} src="/close-sidebar-icon.svg" />
                  <span className="text-base font-medium text-[#23242a] dark:text-[#e5e5e5] underline" style={{ zIndex: 2 }}>Close</span>
                </button>
              </div>
              
              {/* Chapters Content */}
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <p className="text-[10px] text-[#737373] dark:text-gray-400 mb-3">Drag to reorder</p>
                
                {/* Chapter Pills */}
                <div className="flex flex-col gap-2">
                  {chapters.map((ch, i) => {
                    const isSelected = selectedChapter === i;
                    const titleText = ch.title?.trim() || 'Title';
                    
                    // Calculate chapter type label and title
                    const getChapterInfo = () => {
                      if (ch.type === 'frontmatter') {
                        return {
                          typeLabel: 'Frontmatter',
                          title: titleText && titleText !== 'Title' ? titleText : 'Title'
                        };
                      }
                      if (ch.type === 'backmatter') {
                        return {
                          typeLabel: 'Backmatter', 
                          title: titleText && titleText !== 'Title' ? titleText : 'Title'
                        };
                      }
                      // Content chapters
                      const contentChapterNum = getContentChapterNumber(chapters, i);
                      return {
                        typeLabel: `Chapter ${contentChapterNum}`,
                        title: titleText && titleText !== 'Title' ? titleText : 'Title'
                      };
                    };

                    const { typeLabel, title } = getChapterInfo();
                    const isJustAdded = chapterJustAdded === ch.id;
                    
                    return (
                      <div
                        key={i}
                        ref={el => { chapterRefs.current[i] = el }}
                        className={`group flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer select-none relative focus:outline-none transition-all duration-1000 ease-out ${
                          dragOverIndex === i 
                            ? 'border-2 border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
                            : isSelected
                              ? 'bg-gray-100 dark:bg-[#1a1a1a] border border-transparent'
                              : isJustAdded
                                ? 'bg-gray-100/80 dark:bg-gray-700/20 border border-transparent'
                                : 'border border-transparent hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                        }`}
                        style={{ 
                          userSelect: 'none', 
                          WebkitUserSelect: 'none', 
                          WebkitTouchCallout: 'none',
                          // @ts-ignore - WebkitUserDrag is valid but not in TypeScript types
                          WebkitUserDrag: 'none',
                          opacity: dragItemIndex === i && ghostPillPosition.visible ? 0.3 : 1,
                        } as React.CSSProperties}
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
                          <span className={`text-[10px] ${isSelected ? 'text-gray-400 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                            {typeLabel}
                          </span>
                          <span className={`text-sm truncate ${isSelected ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                            {title}
                          </span>
                        </div>
                        {/* Lock button */}
                        <button
                          className={`transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded ${ch.locked ? 'opacity-100 text-gray-600 dark:text-gray-300' : 'opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleChapterLock(i);
                          }}
                          aria-label={ch.locked ? 'Unlock chapter' : 'Lock chapter'}
                          title={ch.locked ? 'Unlock chapter' : 'Mark complete and lock'}
                        >
                          {ch.locked ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0"/>
                            </svg>
                          )}
                        </button>
                        {/* Delete button — hidden when locked */}
                        {chapters.length > 1 && !ch.locked && (
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded text-gray-600 dark:text-gray-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveChapter(i);
                            }}
                            aria-label="Delete Chapter"
                          >
                            <BinIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Add Chapter Button */}
                  <div className="relative mt-2">
                    <button
                      onClick={() => setChapterTypeDropdownOpen(!chapterTypeDropdownOpen)}
                      aria-label="Add new chapter"
                      className="hover:opacity-70 transition-opacity flex items-center gap-2 w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] rounded border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium text-[#050505] dark:text-[#e5e5e5]">Add Chapter</span>
                    </button>
                    {chapterTypeDropdownOpen && (
                      <div ref={dropdownRef} className="absolute z-50 top-full left-0 mt-1 w-full bg-white dark:bg-[#0a0a0a] rounded border border-[#E8E8E8] dark:border-gray-700 shadow-lg max-h-96 overflow-y-auto">
                        <div className="p-3">
                          <div className="space-y-4">
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold px-3 uppercase tracking-wider">
                                  <span className="text-[#050505] dark:text-white">Front Matter</span>
                                </h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.frontmatter.map((template) => (
                                  <button
                                    key={template.title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const newChapterId = handleAddChapter('frontmatter', template.title === 'Custom Front Matter' ? '' : template.title);
                                      setChapterTypeDropdownOpen(false);
                                      setSidebarChaptersExpanded(true);
                                      // Trigger highlight animation
                                      setChapterJustAdded(newChapterId);
                                      setTimeout(() => setChapterJustAdded(null), 1000);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] dark:hover:bg-[#2a2a2a] transition-colors"
                                  >
                                    <div className="text-sm font-medium">
                                      <span className="text-[#15161a] dark:text-white">{template.title}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold px-3 uppercase tracking-wider">
                                  <span className="text-[#050505] dark:text-white">Main Content</span>
                                </h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.content.map((template) => (
                                  <button
                                    key={template.title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const newChapterId = handleAddChapter('content', template.title === 'Custom Chapter' ? '' : template.title);
                                      setChapterTypeDropdownOpen(false);
                                      setSidebarChaptersExpanded(true);
                                      // Trigger highlight animation
                                      setChapterJustAdded(newChapterId);
                                      setTimeout(() => setChapterJustAdded(null), 1000);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] dark:hover:bg-[#2a2a2a] transition-colors"
                                  >
                                    <div className="text-sm font-medium">
                                      <span className="text-[#15161a] dark:text-white">{template.title}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="mb-3">
                                <h4 className="text-xs font-semibold px-3 uppercase tracking-wider">
                                  <span className="text-[#050505] dark:text-white">Back Matter</span>
                                </h4>
                              </div>
                              <div className="space-y-1">
                                {CHAPTER_TEMPLATES.backmatter.map((template) => (
                                  <button
                                    key={template.title}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const newChapterId = handleAddChapter('backmatter', template.title === 'Custom Back Matter' ? '' : template.title);
                                      setChapterTypeDropdownOpen(false);
                                      setSidebarChaptersExpanded(true);
                                      // Trigger highlight animation
                                      setChapterJustAdded(newChapterId);
                                      setTimeout(() => setChapterJustAdded(null), 1000);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F2F2F2] dark:hover:bg-[#2a2a2a] transition-colors"
                                  >
                                    <div className="text-sm font-medium">
                                      <span className="text-[#15161a] dark:text-white">{template.title}</span>
                                    </div>
                                  </button>
                                ))}
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

        {/* Main layout: Mobile-optimized */}
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
          {/* Slim Sidebar Navigation - Desktop Only, hidden in focus mode */}
          {!(focus.active && focus.settings.hideChrome) && <SlimSidebarNav
            activeView={sidebarView}
            onViewChange={setSidebarView}
            libraryCount={libraryBooks.length}
            chaptersCount={chapters.length}
            isPanelOpen={isPanelOpen}
            onLogoClick={handleGoToHome}
            onStartTour={() => {
              onboarding.resetOnboarding();
              if (chapters.length === 0) {
                clearEditorState();
              }
              // Always explicitly start tour — resetOnboarding state update is async,
              // so clearEditorState's internal check sees stale isOnboardingComplete
              setTimeout(() => onboarding.startTour(), chapters.length === 0 ? 800 : 100);
            }}
            onBookMindToggle={() => setRightPanelMode(prev =>
              prev === 'none' ? 'book-mind' :
              prev === 'book-mind' ? 'none' :
              prev === 'live-preview' ? 'both' :
              'live-preview'
            )}
            isBookMindOpen={rightPanelMode === 'book-mind' || rightPanelMode === 'both'}
          />}

          {/* Desktop Sidebar - Hidden on Mobile, animates open/closed */}
          {/* Conditionally hidden in focus mode when hideChrome is on */}
          {!(focus.active && focus.settings.hideChrome) && <CollapsibleSidebar
            isPanelOpen={isPanelOpen}
            activeView={sidebarView}
            onClose={() => setSidebarView(null)}
            libraryBooks={libraryBooks}
            selectedBookId={selectedBookId}
            setSelectedBookId={setSelectedBookId}
            handleLoadBook={library.handleLoadBook}
            handleDeleteBook={library.handleDeleteBook}
            handleExportLibraryBook={library.handleExportLibraryBook}
            showNewBookConfirmation={showNewBookConfirmation}
            showImportDialog={docImport.showImportDialog}
            multiSelectMode={library.multiSelectMode}
            setMultiSelectMode={library.setMultiSelectMode}
            selectedBookIds={library.selectedBookIds}
            toggleBookSelection={library.toggleBookSelection}
            toggleSelectAll={library.toggleSelectAll}
            handleDeleteSelectedBooks={library.handleDeleteSelectedBooks}
            chapters={chapters}
            selectedChapter={selectedChapter}
            handleSelectChapter={handleSelectChapter}
            handleAddChapter={handleAddChapter}
            handleRemoveChapter={handleRemoveChapter}
            handleToggleChapterLock={handleToggleChapterLock}
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
            lockedSections={lockedSections}
            coverUrl={coverUrl}
            totalWords={totalWords}
            pageCount={pageCount}
            readingTime={readingTime}
            handleSaveBook={saveBook.handleSaveBook}
            handleExportEPUB={saveBook.handleExportEPUB}
            handleExportPDF={saveBook.handleExportPDF}
            saveFeedback={saveFeedback}
            exportHistoryCount={exportHistory.length}
            onShowExportHistory={() => setShowExportHistory(true)}
            sidebarLibraryExpanded={sidebarLibraryExpanded}
            setSidebarLibraryExpanded={setSidebarLibraryExpanded}
            sidebarPreviewExpanded={sidebarPreviewExpanded}
            setSidebarPreviewExpanded={setSidebarPreviewExpanded}
            sidebarChaptersExpanded={sidebarChaptersExpanded}
            setSidebarChaptersExpanded={setSidebarChaptersExpanded}
            sidebarBookDetailsExpanded={sidebarBookDetailsExpanded}
            setSidebarBookDetailsExpanded={setSidebarBookDetailsExpanded}
          />}

          {/* Main Editor Panel - Mobile Optimised */}
          <main data-editor-scroll className={`flex-1 flex flex-col bg-white dark:bg-[#0a0a0a] ${chapters.length === 0 ? 'px-0 py-0' : 'px-2 py-8'} ${chapters.length > 0 ? 'lg:pl-8' : 'lg:pl-0'} lg:pr-0 lg:py-0 min-w-0 overflow-x-hidden overflow-y-auto relative`}>
            
            {/* Mobile Header - Compact Status Bar - Hidden when no chapters (landing page) */}
            {chapters.length > 0 && (
            <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-white dark:bg-[#0a0a0a]">
              <div className="flex items-center justify-between px-2 py-1.5 gap-1 border-b border-gray-200 dark:border-gray-700">
                {/* Left: Menu Button */}
                <div className="flex items-center gap-0.5">
                  <button
                    data-tour="mobile-menu"
                    onClick={() => setMobileSidebarOpen(true)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
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
                {/* Right: Preview + Stats Dropdowns */}
                {chapters.length > 0 && (
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {/* Chapter Nav Dropdown - Mobile */}
                    <div className="lg:hidden">
                      <ChapterNavDropdown
                        chapters={chapters}
                        selectedChapter={selectedChapter}
                        onChapterSelect={setSelectedChapter}
                        bookTitle={title}
                      />
                    </div>
                    {/* Quality Check */}
                    <QualityDropdown
                      score={qualityScore}
                      issues={qualityIssues}
                      onNavigateToChapterAction={handleNavigateToChapterFromIssue}
                    />
                    {/* Book Mind Button - Mobile */}
                    <button
                      onClick={() => setMobileBookMindOpen(true)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Book Mind"
                      title="Book Mind"
                    >
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </button>
                    {/* Preview Button */}
                    <button
                      data-tour="mobile-preview"
                      onClick={() => setMobilePreviewOpen(true)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Preview book"
                      title="Preview"
                    >
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 3v18" /></svg>
                    </button>
                  </div>
                )}
              </div>
              {/* Floating Unsaved Bar - only shows when dirty */}
              {isDirty && (
                <div className="flex items-center justify-center gap-2 px-3 py-1 bg-stone-100 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs text-stone-600 dark:text-stone-400">Unsaved changes</span>
                  {!isSaving && (
                    <button
                      onClick={() => { saveBook.saveBookDirectly(false); markClean(); }}
                      className="flex items-center gap-1 px-2 py-0.5 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors"
                    >
                      <SaveIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Save</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            )}

            {/* Desktop Header with Title and Toolbar */}
            <div className="hidden lg:block">
              {/* Chapter content starts here */}
            </div>

            {/* MOBILE OPTIMISED EDITOR - Full Viewport (including tablets) */}
            <div data-tour="mobile-editor" className={`lg:hidden flex flex-col ${chapters.length === 0 ? '' : 'gap-2 pt-[52px]'} flex-1 min-h-0 overflow-y-auto pb-0`}>
              {chapters.length === 0 ? (
                // Landing Page - Mobile version
                <LandingPage
                  onNewBook={handleNewBook}
                  onOpenLibrary={() => setMobileSidebarOpen(true)}
                  libraryCount={libraryBooks.length}
                />
              ) : (
              <>
              {/* Compact Chapter Header - Always visible on mobile for title editing */}
              <div className="flex-shrink-0 bg-white dark:bg-[#0a0a0a] border-none pb-1 px-2 transition-all duration-200">
                {/* Chapter Title Input - Clean UI */}
                <div className="mt-0">
                  <div className="flex items-center gap-0 px-1 py-1">
                    <img alt="Chapter" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6 h-6 flex-shrink-0 dark:hidden" style={{ color: 'transparent' }} src="/chapter-title-icon.svg" />
                    <img alt="Chapter" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6 h-6 flex-shrink-0 hidden dark:block" style={{ color: 'transparent' }} src="/dark-chapter-title-icon.svg" />
                    <input
                      className="flex-1 bg-transparent text-[16px] sm:text-lg font-medium text-[#23242a] dark:text-[#e5e5e5] border-none outline-none focus:outline-none focus:ring-0 focus:border-none placeholder:text-[#a0a0a0] dark:placeholder:text-[#a0a0a0] placeholder:font-normal touch-manipulation min-w-0"
                      style={{ border: 'none', backgroundColor: 'transparent', boxShadow: 'none', fontSize: 'max(16px, 1.125rem)' }}
                      placeholder="Give your chapter a title..."
                      value={chapters[selectedChapter]?.title ?? ""}
                      onChange={(e) =>
                        handleChapterTitleChange(selectedChapter, e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Rich Text Editor - Maximized for Writing */}
              <div className="flex-1 min-h-0 pb-20 sm:pb-0 relative flex flex-col">
                {/* Undo/Redo - Hidden when keyboard is open (compact toolbar takes over) */}
                <div className={`mt-2 mb-1 flex-shrink-0 flex items-start justify-between px-2 transition-all duration-200 ${
                  isMobileKeyboardOpen ? 'hidden' : ''
                }`}>
                  {/* <label className="block text-xs text-[#737373] mb-0">Chapter content</label> */}
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col items-center">
                      <button
                        title="Undo content changes"
                        type="button"
                        className="hover:opacity-70 transition-opacity"
                        onClick={() => {
                          const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
                          if (editorElement) {
                            editorElement.focus();
                            document.execCommand('undo');
                          }
                        }}
                      >
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-full p-2">
                          <Image
                            src="/undo-icon.svg"
                            alt="Undo"
                            width={16}
                            height={16}
                            className="w-4 h-4 dark:invert"
                            style={{ borderRadius: '0', boxShadow: 'none' }}
                          />
                        </div>
                      </button>
                      <span className="text-xs font-medium text-[#050505] dark:text-[#e5e5e5] mt-1">Undo</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <button
                        title="Redo content changes"
                        type="button"
                        className="hover:opacity-70 transition-opacity"
                        onClick={() => {
                          const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
                          if (editorElement) {
                            editorElement.focus();
                            document.execCommand('redo');
                          }
                        }}
                      >
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-full p-2">
                          <Image
                            src="/redo-icon.svg"
                            alt="Redo"
                            width={16}
                            height={16}
                            className="w-4 h-4 dark:invert"
                            style={{ borderRadius: '0', boxShadow: 'none' }}
                          />
                        </div>
                      </button>
                      <span className="text-xs font-medium text-[#050505] dark:text-[#e5e5e5] mt-1">Redo</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-h-0" style={{ minHeight: '400px' }}>
                  {chapters[selectedChapter]?.locked && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                      <LockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>This chapter is locked. Click the lock icon in the chapter list to edit.</span>
                    </div>
                  )}
                  <RichTextEditor
                    value={chapters[selectedChapter]?.content || ""}
                    onChange={(html) => handleChapterContentChange(selectedChapter, html)}
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

            {/* DESKTOP layout */}
            <div className="hidden lg:flex flex-col flex-1 min-h-0 overflow-hidden">
              {chapters.length === 0 ? (
                // Landing Page - Show when no book is loaded
                <LandingPage
                  onNewBook={handleNewBook}
                  onOpenLibrary={() => setSidebarView('library')}
                  libraryCount={libraryBooks.length}
                />
              ) : (
              <SplitPreviewLayout
                chapters={chapters}
                selectedChapter={selectedChapter}
                isPreviewEnabled={isSplitPreviewEnabled}
                onTogglePreviewAction={() => setIsSplitPreviewEnabled(prev => !prev)}
                onChapterSelectAction={(i) => setSelectedChapter(i)}
              >
              <>
              {/* Editor Area - Prioritized for Writing */}
              <section className="flex flex-col min-w-0 flex-1 min-h-0 pt-2">
                {/* Status Bar with Auto-Save and Quality Score */}
                <div className={`flex items-center justify-between px-2 mb-2 transition-opacity duration-300 ${focus.active && focus.settings.hideChrome ? 'focus-hide-chrome' : ''}`}>
                  <div data-tour="auto-save" className="flex items-center gap-2">
                    <AutoSaveIndicator isDirty={isDirty} isSaving={isSaving} lastSaved={lastSaved} hasCloudSync={hasCloudSync} />
                    {isDirty && !isSaving && (
                      <button
                        onClick={() => { saveBook.saveBookDirectly(false); markClean(); }}
                        className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                        title="Save now (⌘S)"
                      >
                        <SaveIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Save</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <ChapterNavDropdown
                      chapters={chapters}
                      selectedChapter={selectedChapter}
                      onChapterSelect={setSelectedChapter}
                      bookTitle={title}
                    />
                    <VersionHistoryButton 
                      versionCount={versions.length} 
                      onClickAction={() => setShowVersionHistory(true)} 
                    />
                    <QualityDropdown
                      score={qualityScore}
                      issues={qualityIssues}
                      onNavigateToChapterAction={handleNavigateToChapterFromIssue}
                    />
                    <FocusModeButton onClick={focus.toggleFocusMode} />
                    <LayoutSwitcher
                      mode={rightPanelMode}
                      onChange={(m) => {
                        setRightPanelMode(m);
                        // Close split preview when a right panel with live preview is shown
                        if (m === 'live-preview' || m === 'both') {
                          setIsSplitPreviewEnabled(false);
                        }
                      }}
                    />
                  </div>
                </div>
                {/* Compact Chapter Title Header - Clean UI */}
                <div className="mb-1 flex-shrink-0 bg-white dark:bg-[#0a0a0a] pb-1">
                  <div className="flex items-center gap-1 px-1 py-1">
                    <img alt="Chapter" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6 h-6 flex-shrink-0 dark:hidden ml-1" style={{ color: 'transparent' }} src="/chapter-title-icon.svg" />
                    <img alt="Chapter" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-6 h-6 flex-shrink-0 hidden dark:block ml-1" style={{ color: 'transparent' }} src="/dark-chapter-title-icon.svg" />
                    <input
                      className="flex-1 bg-transparent text-lg font-medium text-[#23242a] dark:text-[#e5e5e5] border-none outline-none focus:outline-none focus:ring-0 focus:border-none placeholder:text-[#a0a0a0] dark:placeholder:text-[#a0a0a0] placeholder:font-normal min-w-0"
                      style={{ border: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}
                      placeholder="Give your chapter a title..."
                      value={chapters[selectedChapter]?.title ?? ""}
                      onChange={(e) =>
                        handleChapterTitleChange(selectedChapter, e.target.value)
                      }
                    />
                  </div>
                </div>
                {/* Rich Text Editor - Maximum Space */}
                <div
                  data-tour="editor"
                  className={[
                    "w-full flex-1 min-h-0 flex flex-col transition-all duration-300",
                    focus.active && focus.settings.columnWidth === "narrow" ? "focus-col-narrow" : "",
                    focus.active && focus.settings.columnWidth === "normal" ? "focus-col-normal" : "",
                    focus.active && focus.settings.paragraphFocus ? "paragraph-focus" : "",
                    focus.active && focus.settings.typewriterMode ? "typewriter-mode" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <div className="mt-2 mb-3 flex-shrink-0 flex items-start justify-between px-2">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col items-center">
                        <button
                          title="Undo content changes"
                          type="button"
                          className="hover:opacity-70 transition-opacity"
                          onClick={() => {
                            const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
                            if (editorElement) {
                              editorElement.focus();
                              document.execCommand('undo');
                            }
                          }}
                        >
                          <div className="bg-white dark:bg-[#1a1a1a] rounded-full p-2">
                            <Image
                              src="/undo-icon.svg"
                              alt="Undo"
                              width={16}
                              height={16}
                              className="w-4 h-4 dark:invert"
                              style={{ borderRadius: '0', boxShadow: 'none' }}
                            />
                          </div>
                        </button>
                        <span className="text-xs font-medium text-[#050505] dark:text-[#e5e5e5] mt-1">Undo</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <button
                          title="Redo content changes"
                          type="button"
                          className="hover:opacity-70 transition-opacity"
                          onClick={() => {
                            const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
                            if (editorElement) {
                              editorElement.focus();
                              document.execCommand('redo');
                            }
                          }}
                        >
                          <div className="bg-white dark:bg-[#1a1a1a] rounded-full p-2">
                            <Image
                              src="/redo-icon.svg"
                              alt="Redo"
                              width={16}
                              height={16}
                              className="w-4 h-4 dark:invert"
                              style={{ borderRadius: '0', boxShadow: 'none' }}
                            />
                          </div>
                        </button>
                        <span className="text-xs font-medium text-[#050505] dark:text-[#e5e5e5] mt-1">Redo</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    {chapters[selectedChapter]?.locked && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                        <LockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>This chapter is locked. Click the lock icon in the chapter list to edit.</span>
                      </div>
                    )}
                    <RichTextEditor
                      value={chapters[selectedChapter]?.content || ""}
                      onChange={(html) =>
                        handleChapterContentChange(selectedChapter, html)
                      }
                      minHeight={400}
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
                  {/* Word Stats Footer */}
                  <div className="flex-shrink-0 flex items-center justify-center py-2 border-t border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-[#0a0a0a]/50">
                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                      {/* Chapter stats */}
                      <span className="flex items-center gap-1.5">
                        <span className="text-gray-300 dark:text-gray-600">Chapter:</span>
                        <span>{(bookStats.chapterStats?.[selectedChapter]?.wordCount || 0).toLocaleString()} words</span>
                      </span>
                      <span className="text-gray-300 dark:text-gray-700">|</span>
                      {/* Book stats */}
                      <span className="flex items-center gap-1.5">
                        <span className="text-gray-300 dark:text-gray-600">Book:</span>
                        <span>{bookStats.totalWords.toLocaleString()} words</span>
                      </span>
                      {sessionStats.wordsThisSession > 0 && (
                        <>
                          <span className="text-gray-300 dark:text-gray-700">|</span>
                          <span className="text-green-500/70 dark:text-green-500/50">+{sessionStats.wordsThisSession.toLocaleString()} this session</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Right-side preview toggle (desktop) - now uses split preview */}
              <div className="hidden">
                {/* Legacy floating preview toggle - replaced by split preview */}
              </div>
              </>
              </SplitPreviewLayout>
              )}
            </div>
          </main>

          {/* Right Panel — controlled by LayoutSwitcher */}
          {rightPanelMode !== 'none' && !(focus.active && focus.settings.hideChrome) && (
            <ResizableRightPanel>
              {/* Book Mind */}
              {(rightPanelMode === 'book-mind' || rightPanelMode === 'both') && (
                <div className={rightPanelMode === 'both' ? 'flex-1 min-h-0 overflow-hidden' : 'h-full'}>
                  <BookMindPanel
                    bookId={currentBookId}
                    userId={user?.id}
                    title={title}
                    author={author}
                    genre={genre}
                    chapters={chapters.map(c => ({ title: c.title, content: c.content, type: c.type }))}
                    selectedChapterIndex={selectedChapter}
                    selectedText={selectedEditorText}
                    onClose={() => setRightPanelMode(rightPanelMode === 'both' ? 'live-preview' : 'none')}
                  />
                </div>
              )}
              {/* Live Preview Panel */}
              {(rightPanelMode === 'live-preview' || rightPanelMode === 'both') && (
                <div className={`${rightPanelMode === 'both' ? 'flex-1 min-h-0 border-t border-gray-200 dark:border-gray-800' : 'h-full'} overflow-hidden`}>
                  <LivePreviewPanel
                    chapters={chapters}
                    selectedChapter={selectedChapter}
                    onChapterSelect={setSelectedChapter}
                    onClose={() => setRightPanelMode(rightPanelMode === 'both' ? 'book-mind' : 'none')}
                  />
                </div>
              )}
            </ResizableRightPanel>
          )}
        </div>
        {showEreaderPreview && (
          <PreviewEreaderPanel
            chapters={chapters}
            selectedChapter={selectedChapter}
            setSelectedChapter={(i: number) => setSelectedChapter(i)}
            onClose={() => setShowEreaderPreview(false)}
          />
        )}

        {/* Terms/Privacy links moved to mobile editor footer */}
      </div>

      {/* EPUB Reader Modal */}
      <EPUBReaderModal
        isOpen={showEPUBReader}
        onClose={() => setShowEPUBReader(false)}
        epubBlob={epubBlob}
        bookTitle={title}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Cloud Sync"
      />

      {/* Generic Confirm/Alert Dialog */}
      <ConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        message={dialogState.message}
        variant={dialogState.variant}
        confirmLabel={dialogState.confirmLabel}
        onConfirm={dialogState.onConfirm}
        onCancel={() => setDialogState(prev => ({ ...prev, open: false }))}
      />

      {/* Sync Conflict Resolution Dialog */}
      {cloudSync.syncConflicts.length > 0 && cloudSync.syncConflicts[0] && (
        <div className="fixed inset-0 z-[150] bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Sync Conflict</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              &ldquo;{cloudSync.syncConflicts[0].local.title || 'Untitled'}&rdquo; was edited on this device and another.
              {cloudSync.syncConflicts.length > 1 && ` (${cloudSync.syncConflicts.length} conflicts)`}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#1a1a1a]">
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">This device</p>
                <p className="text-gray-500 dark:text-gray-400">{cloudSync.syncConflicts[0].local.chapters.length} chapters</p>
                <p className="text-gray-500 dark:text-gray-400">Saved {formatRelativeTime(cloudSync.syncConflicts[0].local.savedAt)}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#1a1a1a]">
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Cloud</p>
                <p className="text-gray-500 dark:text-gray-400">{cloudSync.syncConflicts[0].cloud.chapters.length} chapters</p>
                <p className="text-gray-500 dark:text-gray-400">Saved {formatRelativeTime(cloudSync.syncConflicts[0].cloud.savedAt)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => cloudSync.handleResolveSyncConflict('cloud')}
                className="w-full px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Keep cloud version
              </button>
              <button
                onClick={() => cloudSync.handleResolveSyncConflict('local')}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Keep this device&apos;s version
              </button>
              <button
                onClick={() => cloudSync.handleResolveSyncConflict('both')}
                className="w-full px-4 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Keep both (creates a copy)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Tour */}
      <OnboardingTour
        isTourActive={onboarding.isTourActive}
        currentStep={onboarding.currentStep}
        totalSteps={onboarding.totalSteps}
        stepData={onboarding.currentStepData}
        onNext={onboarding.nextStep}
        onPrev={onboarding.prevStep}
        onSkip={onboarding.skipTour}
      />

      {/* Focus Mode Panel — floating, always on top when focus is active */}
      {focus.active && (
        <FocusModePanel
          settings={focus.settings}
          onChangeSetting={focus.setSetting}
          onExit={focus.exitFocusMode}
        />
      )}

      {/* Ambient audio — renders nothing to the DOM, just manages audio */}
      <AmbientPlayer
        sound={focus.settings.ambientSound}
        volume={focus.settings.ambientVolume}
        active={focus.active && focus.settings.ambientSound !== "none"}
      />

      {/* Find & Replace Panel */}
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
    </>
  );
}
// User Dropdown Component for Mobile
// Export page without ProtectedRoute wrapper - the MarketingLandingPage handles auth
export default function MakeEbookPageWrapper() {
  return (
    <Suspense fallback={<div>Loading makeEbook...</div>}>
      <MakeEbookPage />
    </Suspense>
  );
}
