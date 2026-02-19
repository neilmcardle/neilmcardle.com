"use client";
import { saveEbookToSupabase } from '@/lib/supabaseEbooks';
import React, { Suspense, useState, useRef, useLayoutEffect, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFeatureAccess } from "@/lib/hooks/useSubscription";
import { BookToolbar } from "@/components/BookToolbar";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PlusIcon, TrashIcon, LibraryIcon, CloseIcon, SaveIcon, DownloadIcon, BookIcon, LockIcon, MetadataIcon, MenuIcon } from "./components/icons";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import LandingPage from "./components/LandingPage";
import MarketingLandingPage from "./components/MarketingLandingPage";
import DragIcon from "./components/icons/DragIcon";
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
import { exportEpub } from "./utils/exportEpub";
import { exportPdf } from "./utils/exportPdf";
import { TypographyPreset } from "./utils/typographyPresets";
import RichTextEditor from "./components/RichTextEditor";
import CollapsibleSidebar from "./components/CollapsibleSidebar";
import SlimSidebarNav from "./components/SlimSidebarNav";
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
import {
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { loadBookLibrary, saveBookToLibrary, loadBookById, removeBookFromLibrary, normalizeBookFromSupabase, saveLibraryToStorage } from "./utils/bookLibrary";

const HEADER_HEIGHT = 64; // px (adjust if your header is taller/shorter)

function formatRelativeTime(ms: number): string {
  const diff = Math.abs(Date.now() - ms);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  return new Date(ms).toLocaleDateString();
}

function plainText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getContentChapterNumber(chapters: any[], currentIndex: number) {
  // Count only content chapters up to and including the current index
  let contentChapterCount = 0;
  for (let i = 0; i <= currentIndex; i++) {
    if (chapters[i]?.type === 'content') {
      contentChapterCount++;
    }
  }
  return contentChapterCount;
}

function ChapterCapsuleMarker({ markerStyle }: { markerStyle: { top: number; height: number } }) {
  return (
    <span
      className="absolute"
      style={{
        left: -18,
        top: (markerStyle.top ?? 0) + 12,
        width: 4,
        height: 24,
        backgroundColor: "#717274",
        borderRadius: 9999,
        transition: "top 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 1,
        display: "block",
      }}
      aria-hidden="true"
    />
  );
}

function HandleDragIcon({ isSelected }: { isSelected: boolean }) {
  return (
    <span
      className="relative w-4 h-5 shrink-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition"
      aria-hidden="true"
    >
      <DragIcon 
        className={`w-4 h-4 transition ${
          isSelected ? "brightness-0 invert" : "brightness-0"
        }`}
      />
    </span>
  );
}

// Mobile Live Preview — mirrors desktop SplitPreviewLayout
type MobilePreviewTheme = 'light' | 'sepia' | 'dark';
type MobilePreviewDevice = 'kindle' | 'ipad' | 'phone';

const mobileDeviceDimensions = {
  kindle: { width: 260, height: 380, name: 'Kindle' },
  ipad: { width: 300, height: 400, name: 'iPad' },
  phone: { width: 220, height: 380, name: 'Phone' },
};

function MobilePreviewModal({
  chapters,
  selectedChapter,
  onChapterSelect,
  onClose,
}: {
  chapters: Chapter[];
  selectedChapter: number;
  onChapterSelect: (i: number) => void;
  onClose: () => void;
}) {
  const [device, setDevice] = React.useState<MobilePreviewDevice>('kindle');
  const [theme, setTheme] = React.useState<MobilePreviewTheme>('light');
  const dim = mobileDeviceDimensions[device];
  const chapter = chapters[selectedChapter];

  const textColor = theme === 'dark' ? '#e5e5e5' : '#141413';
  const screenBg = theme === 'light' ? '#faf9f5' : theme === 'sepia' ? '#f4ecd8' : '#1a1a1a';

  return (
    <div className="fixed inset-0 z-[130] flex flex-col lg:hidden overflow-hidden bg-[#f0eee6] dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-[#e4e4de] dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-[#141413] dark:text-white">Live Preview</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#e9e8e4] dark:hover:bg-gray-800 rounded transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-4 h-4 text-[#141413]/50 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Device Selector */}
        <div className="flex gap-1">
          {(Object.entries(mobileDeviceDimensions) as [MobilePreviewDevice, typeof mobileDeviceDimensions.kindle][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                device === key
                  ? 'bg-[#141413] text-[#faf9f5] dark:bg-white dark:text-black'
                  : 'bg-[#e9e8e4] dark:bg-gray-700 text-[#141413]/70 dark:text-gray-300 hover:bg-[#e4e4de] dark:hover:bg-gray-600'
              }`}
            >
              {val.name}
            </button>
          ))}
        </div>
      </div>

      {/* E-Reader Frame */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div
          className="relative bg-[#2a2a2a] p-2 shadow-2xl"
          style={{ width: dim.width + 16, borderRadius: 24 }}
        >
          <div
            className="w-full rounded-lg overflow-hidden transition-colors"
            style={{ width: dim.width, height: dim.height, maxWidth: '100%', backgroundColor: screenBg }}
          >
            <div className="h-full overflow-y-auto">
              {chapter ? (
                <article
                  className="p-5"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: textColor, lineHeight: 1.8, fontSize: '13px' }}
                >
                  {chapter.title && (
                    <h1 className="text-base font-bold mb-3 text-center" style={{ color: textColor }}>
                      {chapter.title}
                    </h1>
                  )}
                  <div
                    dangerouslySetInnerHTML={{ __html: chapter.content || '<p style="color: #999; font-style: italic;">No content yet...</p>' }}
                    style={{ textAlign: 'justify' }}
                    className="[&_p]:mb-3 [&_p]:text-indent-4"
                  />
                </article>
              ) : (
                <div className="h-full flex items-center justify-center p-6">
                  <p className="text-gray-400 text-sm">No chapter selected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Navigation Tabs */}
      {chapters.length > 1 && (
        <div className="flex-shrink-0 px-3 pb-2 border-t border-[#e4e4de] dark:border-gray-800">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => onChapterSelect(i)}
                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  i === selectedChapter
                    ? 'bg-[#141413] text-[#faf9f5] dark:bg-white dark:text-black'
                    : 'bg-[#e9e8e4] dark:bg-gray-800 text-[#141413]/70 dark:text-gray-300 hover:bg-[#e4e4de] dark:hover:bg-gray-700'
                }`}
              >
                {ch.title || `Ch ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Theme Dots */}
      <div className="flex-shrink-0 p-3 border-t border-[#e4e4de] dark:border-gray-800">
        <div className="flex items-center justify-center gap-3">
          {(['light', 'sepia', 'dark'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                theme === t
                  ? 'scale-110 border-[#141413] dark:border-white shadow-md'
                  : 'border-[#dedddd] dark:border-gray-600 hover:border-[#141413]/40'
              }`}
              style={{
                backgroundColor: t === 'light' ? '#faf9f5' : t === 'sepia' ? '#f4ecd8' : '#1a1a1a',
              }}
              aria-label={`${t} theme`}
              title={t.charAt(0).toUpperCase() + t.slice(1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MakeEbookPage() {
  // Auth context for Supabase user
  const { user, signOut } = useAuth();

  // Check if user has Pro access for Cloud Sync
  const hasCloudSync = useFeatureAccess('cloud_sync');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Next/navigation helpers
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch ebooks from Supabase on login and merge with local library
  useEffect(() => {
    async function fetchAndSyncSupabaseBooks() {
      if (user && user.id) {
        try {
          const supabaseBooks = await import('@/lib/supabaseEbooks').then(m => m.fetchEbooksFromSupabase(user.id));
          if (Array.isArray(supabaseBooks) && supabaseBooks.length > 0) {
            const localBooks = loadBookLibrary();
            const bookMap = new Map(localBooks.map(b => [b.id, b]));
            const conflicts: { local: import('./types').BookRecord; cloud: import('./types').BookRecord }[] = [];

            for (const raw of supabaseBooks) {
              if (!raw.id) continue;
              const normalized = normalizeBookFromSupabase(raw);
              const existing = bookMap.get(raw.id);

              if (!existing) {
                // Cloud-only book — add it
                bookMap.set(raw.id, normalized);
              } else {
                // Book exists both locally and in cloud
                const timeDiff = Math.abs(normalized.savedAt - existing.savedAt);
                if (timeDiff < 5000) {
                  // Timestamps within 5 seconds — same save, no conflict
                  continue;
                }
                // Check if content actually differs
                const contentSame =
                  existing.title === normalized.title &&
                  existing.author === normalized.author &&
                  existing.chapters.length === normalized.chapters.length &&
                  existing.chapters.every((ch, i) =>
                    ch.title === normalized.chapters[i]?.title &&
                    ch.content === normalized.chapters[i]?.content
                  );
                if (contentSame) {
                  // Content identical, take the newer timestamp
                  if (normalized.savedAt > existing.savedAt) {
                    bookMap.set(raw.id, normalized);
                  }
                } else {
                  // Real conflict — content differs
                  conflicts.push({ local: existing, cloud: normalized });
                }
              }
            }

            if (conflicts.length > 0) {
              // Store the merged map (without conflicts) and show conflict dialog
              setSyncMergedMap(bookMap);
              setSyncConflicts(conflicts);
            } else {
              // No conflicts — save immediately
              const mergedBooks = Array.from(bookMap.values());
              isLoadingBookRef.current = true;
              setLibraryBooks(mergedBooks);
              saveLibraryToStorage(mergedBooks);
              setTimeout(() => { isLoadingBookRef.current = false; }, 0);
            }
          }
        } catch (err) {
          console.error('Failed to sync Supabase books:', err);
        }
      }
    }
    fetchAndSyncSupabaseBooks();
  }, [user]);
  
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
  const isSavingRef = useRef(false);

  // Show marketing landing page when no books and user hasn't started editing
  const [showMarketingPage, setShowMarketingPage] = useState(true);

  // EPUB Reader modal state
  const [showEPUBReader, setShowEPUBReader] = useState(false);
  const [epubBlob, setEpubBlob] = useState<Blob | null>(null);

  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileChaptersOpen, setMobileChaptersOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
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

  // Sync conflict resolution state
  const [syncConflicts, setSyncConflicts] = useState<{
    local: import('./types').BookRecord;
    cloud: import('./types').BookRecord;
  }[]>([]);
  const [syncMergedMap, setSyncMergedMap] = useState<Map<string, import('./types').BookRecord> | null>(null);
  
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

  // Multi-select for library books
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);

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
  
  // Split preview state - enabled by default on desktop so users see the e-reader preview
  const [isSplitPreviewEnabled, setIsSplitPreviewEnabled] = useState(true);

  // Onboarding tour
  const onboarding = useOnboarding({
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
  const { bookStats, sessionStats } = useWordStats(chapters);

  // Version history hook
  const { 
    versions, 
    saveVersion, 
    deleteVersion, 
    clearHistory, 
    formatTimestamp,
    hasVersions 
  } = useVersionHistory({ bookId: currentBookId });

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

  // Auto-save hook - Creates draft book if needed to prevent data loss
  const handleAutoSave = useCallback(() => {
    // Auto-save will create a draft book if one doesn't exist
    // This prevents data loss when users click away before manually saving
    saveBookDirectly(false);
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

  // Warn before leaving with unsaved changes
  useUnsavedChangesWarning(isDirty);

  // Keyboard shortcuts
  useEditorShortcuts({
    onSave: () => {
      handleSaveBook();
    },
    onExport: () => {
      handleExportEPUB();
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

  // Track previous endnotes count to detect when all are removed
  const prevEndnotesCountRef = useRef(0);

  // Update endnotes chapter content whenever endnotes change
  useEffect(() => {
    if (endnotes.length > 0 || chapters.some(ch => ch.title.toLowerCase() === 'endnotes')) {
      updateEndnotesChapterContent(endnotes);
    }
    // Reset numbering and notify user when all endnotes are deleted
    if (endnotes.length === 0 && prevEndnotesCountRef.current > 0) {
      setNextEndnoteNumber(1);
      setDialogState({
        open: true,
        title: 'Endnotes Removed',
        message: 'All endnotes have been deleted. The Endnotes chapter has been removed from your book.',
        variant: 'alert',
        onConfirm: () => setDialogState(prev => ({ ...prev, open: false })),
      });
    }
    prevEndnotesCountRef.current = endnotes.length;
  }, [endnotes]);

  // Handle bidirectional endnote navigation (chapter ↔ endnotes)
  useEffect(() => {
    function handleEndnoteClick(event: MouseEvent) {
      const target = event.target as HTMLElement;

      // Check if click is on a link element or its children
      const linkElement = target.closest('a');
      if (!linkElement) return;

      // Check for back-link (endnotes → chapter)
      if (linkElement.classList.contains('endnote-back')) {
        event.preventDefault();
        event.stopPropagation();

        const refNumber = linkElement.getAttribute('data-back-to-ref');

        if (refNumber) {
          // Find which chapter contains this reference
          const ref = endnoteReferences.find(r => r.number === parseInt(refNumber));
          if (ref) {
            const chapterIndex = chapters.findIndex(ch => ch.id === ref.chapterId);
            if (chapterIndex >= 0) {
              setSelectedChapter(chapterIndex);

              // Scroll to reference after chapter switches
              setTimeout(() => {
                const refElement = document.getElementById(`ref${refNumber}`);
                if (refElement) {
                  refElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Highlight effect
                  refElement.style.backgroundColor = '#ffeb3b';
                  setTimeout(() => {
                    refElement.style.backgroundColor = '';
                  }, 1000);
                }
              }, 150);
            }
          }
        }
        return;
      }

      // Check for forward-link (chapter → endnotes)
      const endnoteRef = linkElement.getAttribute('data-endnote-ref');
      if (endnoteRef) {
        event.preventDefault();
        event.stopPropagation();

        // Find the endnotes chapter
        const endnotesIndex = chapters.findIndex(ch => ch.title.toLowerCase() === 'endnotes');
        if (endnotesIndex >= 0) {
          setSelectedChapter(endnotesIndex);

          // Scroll to endnote after chapter switches
          setTimeout(() => {
            const endElement = document.getElementById(`end${endnoteRef}`);
            if (endElement) {
              endElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight effect
              endElement.style.backgroundColor = '#ffeb3b';
              setTimeout(() => {
                endElement.style.backgroundColor = '';
              }, 1000);
            }
          }, 150);
        }
      }
    }

    // Attach to document with capture phase to intercept before contenteditable
    document.addEventListener('click', handleEndnoteClick, true);
    return () => document.removeEventListener('click', handleEndnoteClick, true);
  }, [chapters, endnoteReferences, setSelectedChapter]);

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

  // Document import state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  async function handleImportDocument(file: File) {
    setImporting(true);
    setImportError(null);
    
    try {
      const { parseDocument, getSupportedFormats } = await import('./utils/documentParser');
      
      const extension = file.name.split('.').pop()?.toLowerCase();
      const supported = getSupportedFormats().map(f => f.replace('.', ''));
      
      if (!extension || !supported.includes(extension)) {
        throw new Error(`Unsupported format. Supported: ${getSupportedFormats().join(', ')}`);
      }
      
      const parsed = await parseDocument(file);
      
      // Create a new book with the imported content
      const newChapters = parsed.chapters.map((ch, idx) => ({
        id: `chapter-${Date.now()}-${idx}`,
        title: ch.title,
        content: ch.content,
        type: ch.type,
      }));
      
      // Set the editor state
      resetMetadata();
      setTitle(parsed.title);
      setAuthor(parsed.author);
      setChapters(newChapters);
      setSelectedChapter(0);
      setTags([]);
      clearCover();
      
      // Open Book panel for user to complete details
      setSidebarView('book');
      setImportDialogOpen(false);
      
    } catch (err) {
      console.error('Import error:', err);
      setImportError(err instanceof Error ? err.message : 'Failed to import document');
    } finally {
      setImporting(false);
    }
  }

  function handleImportFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleImportDocument(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }

  function showImportDialog() {
    setImportError(null);
    setImportDialogOpen(true);
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
    saveBookDirectly(false);
    saveVersionSnapshot();
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
      handleLoadBook(mostRecent.id);
      // Also open the library sidebar so they can switch books
      setSidebarView('library');
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
    const books = loadBookLibrary();
    setLibraryBooks(books);

  const loadBookId = searchParams ? searchParams.get('load') : null;
    if (loadBookId) {
      const bookToLoad = books.find(book => book.id === loadBookId);
      if (bookToLoad) {
        setShowMarketingPage(false); // Dismiss marketing page when loading a book
        handleLoadBook(loadBookId);
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

  async function handleExportEPUB() {
    // Ensure all chapters have IDs before export
    const migratedChapters = ensureChapterIds(chapters);
    const migratedEndnoteRefs = migrateEndnoteReferences(endnoteReferences, migratedChapters);

    // Update state with migrated data
    setChapters(migratedChapters);
    setEndnoteReferences(migratedEndnoteRefs);

    // Calculate word count for export record
    const totalWords = migratedChapters.reduce((sum, ch) => {
      const text = ch.content.replace(/<[^>]+>/g, ' ');
      return sum + text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }, 0);

    // Generate EPUB blob for preview
    const blob = await exportEpub({
      title,
      author,
      blurb,
      publisher,
      pubDate,
      isbn,
      language,
      genre,
      tags,
      coverFile: coverUrl,
      chapters: migratedChapters,
      endnoteReferences: migratedEndnoteRefs,
      typographyPreset,
      returnBlob: true, // Get blob instead of downloading
    }) as Blob;

    // Save to export history
    await saveExport({
      title,
      author,
      wordCount: totalWords,
      chapterCount: migratedChapters.length,
      blob,
    });

    // Save blob and open reader
    setEpubBlob(blob);
    setShowEPUBReader(true);

    // Also download the file
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]+/gi, "_") || "ebook"}.epub`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    // Mark as clean after successful export
    markClean();
  }

  function handleExportPDF() {
    const migratedChapters = ensureChapterIds(chapters);
    exportPdf({
      title,
      author,
      publisher,
      chapters: migratedChapters,
      typographyPreset,
    });
  }

  // Handle preview from export history
  async function handlePreviewExport(exportId: string) {
    const blob = await getExportBlob(exportId);
    if (blob) {
      setEpubBlob(blob);
      setShowEPUBReader(true);
      setShowExportHistory(false);
    }
  }

  // Handle download from export history
  async function handleDownloadExport(exportId: string) {
    const blob = await getExportBlob(exportId);
    const exportMeta = exportHistory.find(e => e.id === exportId);

    if (blob && exportMeta) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportMeta.title.replace(/[^a-z0-9]+/gi, "_") || "ebook"}.epub`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }
  }

  function handleSaveBook() {
    // Don't save if there's no meaningful content
    const hasContent = title.trim() || author.trim() || chapters.some(ch => ch.content.trim());
    if (!hasContent) return;
    
    // If there's already a book ID and it exists in library, show save dialog
    if (currentBookId) {
      const library = loadBookLibrary();
      const existingBook = library.find((b: any) => b.id === currentBookId);
      if (existingBook) {
        setSaveDialogOpen(true);
        return;
      }
    }
    
    // No existing book, save normally (creates new book)
    saveBookDirectly(false);
    saveVersionSnapshot();
  }

  // Save a version snapshot (only called on manual saves, not auto-save)
  function saveVersionSnapshot() {
    saveVersion(title, author, chapters, {
      blurb,
      publisher,
      pubDate,
      genre,
      tags,
    });
  }

  async function saveBookDirectly(forceNewVersion: boolean) {
    // Prevent concurrent saves
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      const bookData = {
        id: forceNewVersion ? undefined : currentBookId,
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
        coverFile: coverUrl,
        endnotes,
        endnoteReferences,
      };

      // Save to localStorage with quota error handling
      let id: string;
      try {
        id = saveBookToLibrary(bookData);
      } catch (storageErr) {
        console.error('localStorage save failed:', storageErr);
        setDialogState({
          open: true,
          title: 'Storage Full',
          message: 'Your browser storage is full. Try deleting old books from your library to free up space.',
          variant: 'alert',
          onConfirm: () => setDialogState(prev => ({ ...prev, open: false })),
        });
        return;
      }

      setCurrentBookId(id);
      setLibraryBooks(loadBookLibrary());
      setSaveFeedback(true);
      markClean();
      setTimeout(() => setSaveFeedback(false), 1300);

      // Save to Supabase (if user is logged in and has Pro access)
      if (user && user.id && hasCloudSync) {
        try {
          const supabaseData = await saveEbookToSupabase(bookData, chapters, user.id);
          // If Supabase assigned a UUID different from local ID, update local to match
          if (supabaseData?.id && supabaseData.id !== id) {
            removeBookFromLibrary(id);
            saveBookToLibrary({ ...bookData, id: supabaseData.id });
            setCurrentBookId(supabaseData.id);
            setLibraryBooks(loadBookLibrary());
          }
        } catch (err) {
          console.error('Supabase sync failed:', err);
          setDialogState({
            open: true,
            title: 'Cloud Sync Failed',
            message: 'Your book was saved locally, but cloud sync failed. Your changes will sync next time.',
            variant: 'alert',
            onConfirm: () => setDialogState(prev => ({ ...prev, open: false })),
          });
        }
      }
    } finally {
      isSavingRef.current = false;
    }
  }

  function handleOverwriteBook() {
    setSaveDialogOpen(false);
    saveBookDirectly(false);
    saveVersionSnapshot();

    // If this was triggered from new book flow, clear editor after save
    if (newBookConfirmOpen) {
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  function handleSaveAsNewVersion() {
    setSaveDialogOpen(false);
    saveBookDirectly(true);
    saveVersionSnapshot();

    // If this was triggered from new book flow, clear editor after save
    if (newBookConfirmOpen) {
      clearEditorState();
      setNewBookConfirmOpen(false);
    }
  }

  // Endnote Management Functions
  function createEndnote(endnoteContent: string, sourceChapterId: string) {
    const endnoteId = `endnote-${Date.now()}`;
    const endnoteNumber = nextEndnoteNumber;

    // Create the endnote
    const newEndnote: Endnote = {
      id: endnoteId,
      number: endnoteNumber,
      content: endnoteContent,
      sourceChapterId,
      sourceText: '', // No longer using selected text
    };

    // Create the reference
    const newReference: EndnoteReference = {
      id: `ref${endnoteNumber}`,
      number: endnoteNumber,
      chapterId: sourceChapterId,
      endnoteId,
    };

    setEndnotes(prev => [...prev, newEndnote]);
    setEndnoteReferences(prev => [...prev, newReference]);
    setNextEndnoteNumber(prev => prev + 1);

    // Create a clickable endnote reference with proper ePub structure
    const endnoteLink = `<a class="note-${endnoteNumber}" href="#end${endnoteNumber}" id="ref${endnoteNumber}" title="note ${endnoteNumber}" data-endnote-ref="${endnoteNumber}" data-endnote-id="${endnoteId}" style="color: #0066cc; text-decoration: none;"><sup>[${endnoteNumber}]</sup></a>`;

    return endnoteLink;
  }

  // Two-way endnote sync: detect deletions from either direction
  // Direction 1: user backspaces an endnote reference [1] in a chapter → remove the endnote
  // Direction 2: user backspaces an endnote entry in the Endnotes chapter → remove the reference from the source chapter
  useEffect(() => {
    if (endnotes.length === 0 && endnoteReferences.length === 0) return;

    // --- Direction 1: check for orphaned references (marker deleted from chapter text) ---
    const allChapterHtml = chapters
      .filter(ch => ch.title.toLowerCase() !== 'endnotes')
      .map(ch => ch.content)
      .join('');

    const survivingRefIds = new Set<string>();
    const refMatches = allChapterHtml.matchAll(/data-endnote-id="([^"]+)"/g);
    for (const m of refMatches) {
      survivingRefIds.add(m[1]);
    }

    const orphanedFromChapters = endnoteReferences.filter(r => !survivingRefIds.has(r.endnoteId));

    // --- Direction 2: check for endnote entries deleted from the Endnotes chapter ---
    const endnotesChapter = chapters.find(ch => ch.title.toLowerCase() === 'endnotes');
    let orphanedFromEndnotesChapter: string[] = [];

    if (endnotesChapter && endnotes.length > 0) {
      const survivingEntryIds = new Set<string>();
      const entryMatches = endnotesChapter.content.matchAll(/data-endnote-entry-id="([^"]+)"/g);
      for (const m of entryMatches) {
        survivingEntryIds.add(m[1]);
      }

      // Endnotes in our array but missing from the chapter HTML = user deleted them
      orphanedFromEndnotesChapter = endnotes
        .filter(e => !survivingEntryIds.has(e.id))
        .map(e => e.id);
    }

    // Combine both sets of orphaned endnote IDs
    const allOrphanedIds = new Set([
      ...orphanedFromChapters.map(r => r.endnoteId),
      ...orphanedFromEndnotesChapter,
    ]);

    if (allOrphanedIds.size === 0) return;

    // Remove references from source chapter HTML (for endnotes deleted from the Endnotes chapter)
    if (orphanedFromEndnotesChapter.length > 0) {
      setChapters(prev => prev.map(ch => {
        if (ch.title.toLowerCase() === 'endnotes') return ch;
        let content = ch.content;
        for (const id of orphanedFromEndnotesChapter) {
          content = content.replace(
            new RegExp(`<a[^>]*data-endnote-id="${id}"[^>]*>.*?</a>`, 'gi'),
            ''
          );
        }
        return content !== ch.content ? { ...ch, content } : ch;
      }));
    }

    // Clean up endnotes and references arrays
    setEndnotes(prev => prev.filter(e => !allOrphanedIds.has(e.id)));
    setEndnoteReferences(prev => prev.filter(r => !allOrphanedIds.has(r.endnoteId)));
  }, [chapters]);

  function updateEndnotesChapterContent(currentEndnotes: Endnote[]) {
    // Accept endnotes as parameter to avoid stale closure issues
    setChapters(currentChapters => {
      const endnotesChapterIndex = currentChapters.findIndex(ch => ch.title.toLowerCase() === 'endnotes');

      // Generate endnotes content (create shallow copy to avoid mutating state)
      const endnotesContent = [...currentEndnotes]
        .sort((a, b) => a.number - b.number)
        .map(endnote => {
          const backLink = `<a href="#ref${endnote.number}" id="end${endnote.number}" data-back-to-ref="${endnote.number}" class="endnote-back" style="color: #0066cc; text-decoration: none; margin-left: 8px; cursor: pointer; user-select: none; font-weight: bold; font-size: 14px; padding: 2px 6px; border: 1px solid #0066cc; border-radius: 3px; background-color: #f0f8ff; display: inline-block;">[${endnote.number}]</a>`;
          return `<p data-endnote-entry-id="${endnote.id}">${endnote.number}. ${endnote.content} ${backLink}</p>`;
        })
        .join('');

      const updatedChapters = [...currentChapters];

      if (endnotesChapterIndex === -1) {
        // Only create new endnotes chapter if we have endnotes to show
        if (currentEndnotes.length === 0) return currentChapters;

        const newEndnotesChapter = {
          id: `endnotes-${Date.now()}`,
          title: 'Endnotes',
          content: endnotesContent,
          type: 'backmatter' as const,
        };
        updatedChapters.push(newEndnotesChapter);
      } else {
        // Update existing endnotes chapter (or remove if no endnotes)
        if (currentEndnotes.length === 0) {
          // Remove the endnotes chapter if there are no endnotes
          updatedChapters.splice(endnotesChapterIndex, 1);
        } else {
          updatedChapters[endnotesChapterIndex] = {
            ...updatedChapters[endnotesChapterIndex],
            content: endnotesContent,
          };
        }
      }

      return updatedChapters;
    });
  }
  
  // Migration function to ensure all chapters have IDs
  function ensureChapterIds(chapters: Chapter[]): Chapter[] {
    return chapters.map(chapter => ({
      ...chapter,
      id: chapter.id || `chapter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
  }

  // Migration function to update endnote references with unknown chapter IDs
  function migrateEndnoteReferences(endnoteRefs: EndnoteReference[], chapters: Chapter[]): EndnoteReference[] {
    return endnoteRefs.map(ref => {
      if (ref.chapterId === 'unknown' || !ref.chapterId) {
        // Try to find the chapter by context - for now, assign to first content chapter
        const firstContentChapter = chapters.find(ch => ch.type === 'content');
        return {
          ...ref,
          chapterId: firstContentChapter?.id || chapters[0]?.id || 'fallback-chapter'
        };
      }
      return ref;
    });
  }

  function handleCreateEndnote(endnoteContent: string, chapterId?: string) {
    if (!endnoteContent.trim()) return '';

    const currentChapterId = chapterId || (selectedChapter >= 0 && chapters[selectedChapter] ? chapters[selectedChapter].id : 'unknown');
    const endnoteLink = createEndnote(endnoteContent, currentChapterId);

    return endnoteLink;
  }

  function handleLoadBook(id: string) {
    const loaded = loadBookById(id);
    if (loaded) {
      isLoadingBookRef.current = true;
      setShowMarketingPage(false);
      loadMetadata({ ...loaded, id: loaded.id });
      setTags(loaded.tags || []);
      setCoverUrl(loaded.coverFile || null);

      // Migrate chapters to ensure they have IDs
      // If no chapters exist, create a default one to avoid showing landing page
      const loadedChapters = loaded.chapters && Array.isArray(loaded.chapters) && loaded.chapters.length > 0
        ? loaded.chapters
        : [{ id: `chapter-${Date.now()}`, title: "", content: "", type: "content" as const }];
      const migratedChapters = ensureChapterIds(loadedChapters);
      setChapters(migratedChapters);

      // Migrate endnote references if they exist
      if (loaded.endnoteReferences) {
        const migratedEndnoteRefs = migrateEndnoteReferences(loaded.endnoteReferences, migratedChapters);
        setEndnoteReferences(migratedEndnoteRefs);
      }

      const loadedEndnotes = loaded.endnotes || [];
      setEndnotes(loadedEndnotes);
      // Restore nextEndnoteNumber so new endnotes don't collide with existing ones
      const maxNumber = loadedEndnotes.reduce((max: number, e: Endnote) => Math.max(max, e.number), 0);
      setNextEndnoteNumber(maxNumber + 1);
      setCurrentBookId(loaded.id);
      setSelectedChapter(0);

      // Close sidebars so user sees their book
      setMobileSidebarOpen(false);
      setSidebarView(null);

      // Trigger highlight animation
      setBookJustLoaded(true);
      setTimeout(() => setBookJustLoaded(false), 1000);

      // Reset guard after React batches state updates
      setTimeout(() => { isLoadingBookRef.current = false; }, 0);
    }
  }

  // Remove export history entries from IndexedDB for a given book
  function cleanupExportHistory(bookId: string) {
    try {
      const req = indexedDB.open('makeEbookExports', 1);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('exports', 'readwrite');
        const store = tx.objectStore('exports');
        const idx = store.index('bookId');
        const cursor = idx.openCursor(IDBKeyRange.only(bookId));
        cursor.onsuccess = () => {
          const c = cursor.result;
          if (c) { c.delete(); c.continue(); }
        };
      };
    } catch (e) { /* non-critical */ }
  }

  function handleDeleteBook(id: string) {
    setDialogState({
      open: true,
      title: 'Delete Book',
      message: 'Are you sure you want to delete this eBook? This action cannot be undone.',
      variant: 'destructive',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setDialogState(prev => ({ ...prev, open: false }));
        const bookToDelete = libraryBooks.find(b => b.id === id);

        // Delete from Supabase first (if applicable)
        if (user && user.id && hasCloudSync) {
          try {
            const { deleteEbookFromSupabase } = await import('@/lib/supabaseEbooks');
            await deleteEbookFromSupabase(id, user.id, bookToDelete?.title);
          } catch (err) {
            console.error('Failed to delete from Supabase:', err);
            setDialogState({
              open: true,
              title: 'Delete Failed',
              message: 'Could not delete from cloud. The book was kept to prevent data loss. Please try again.',
              variant: 'alert',
              onConfirm: () => setDialogState(prev => ({ ...prev, open: false })),
            });
            return; // Don't delete locally if cloud delete failed
          }
        }

        // Cloud delete succeeded (or not applicable) — now delete locally
        removeBookFromLibrary(id);
        setLibraryBooks(loadBookLibrary());

        // Clean up version history (localStorage) for the deleted book
        try { localStorage.removeItem(`makeebook-versions-${id}`); } catch (e) { /* non-critical */ }
        // Clean up export history (IndexedDB) for the deleted book
        cleanupExportHistory(id);

        if (currentBookId === id) {
          clearEditorState();
        }
      },
    });
  }

  function handleDeleteSelectedBooks() {
    const count = selectedBookIds.size;
    if (count === 0) return;

    setDialogState({
      open: true,
      title: 'Delete Books',
      message: `Are you sure you want to delete ${count} book${count > 1 ? 's' : ''}? This action cannot be undone.`,
      variant: 'destructive',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setDialogState(prev => ({ ...prev, open: false }));
        let cloudFailed = false;

        for (const id of selectedBookIds) {
          const bookToDelete = libraryBooks.find(b => b.id === id);

          // Delete from Supabase first (if applicable)
          if (user && user.id && hasCloudSync) {
            try {
              const { deleteEbookFromSupabase } = await import('@/lib/supabaseEbooks');
              await deleteEbookFromSupabase(id, user.id, bookToDelete?.title);
            } catch (err) {
              console.error('Failed to delete from Supabase:', err);
              cloudFailed = true;
              continue; // Skip local delete for this book
            }
          }

          removeBookFromLibrary(id);

          // Clean up version history (localStorage) and export history (IndexedDB)
          try { localStorage.removeItem(`makeebook-versions-${id}`); } catch (e) { /* non-critical */ }
          cleanupExportHistory(id);

          if (currentBookId === id) {
            clearEditorState();
          }
        }

        setLibraryBooks(loadBookLibrary());
        setSelectedBookIds(new Set());
        setMultiSelectMode(false);

        if (cloudFailed) {
          setDialogState({
            open: true,
            title: 'Some Deletes Failed',
            message: 'Some books could not be deleted from the cloud. They were kept locally to prevent data loss.',
            variant: 'alert',
            onConfirm: () => setDialogState(prev => ({ ...prev, open: false })),
          });
        }
      },
    });
  }

  function toggleBookSelection(id: string) {
    setSelectedBookIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function toggleSelectAll() {
    if (selectedBookIds.size === libraryBooks.length) {
      setSelectedBookIds(new Set());
    } else {
      setSelectedBookIds(new Set(libraryBooks.map(b => b.id)));
    }
  }

  async function handleExportLibraryBook(id: string) {
    const book = libraryBooks.find(b => b.id === id);
    if (!book) return;
    
    // Ensure all chapters have IDs before export
    const migratedChapters = ensureChapterIds(book.chapters);
    const migratedEndnoteRefs = migrateEndnoteReferences(book.endnoteReferences || [], migratedChapters);
    
    await exportEpub({
      title: book.title,
      author: book.author,
      blurb: book.blurb,
      publisher: book.publisher,
      pubDate: book.pubDate,
      isbn: book.isbn,
      language: book.language,
      genre: book.genre,
      tags: book.tags,
      coverFile: book.coverFile || null,
      chapters: migratedChapters,
      endnoteReferences: migratedEndnoteRefs,
    });
  }

  // Resolve a sync conflict — called once per conflict from the dialog
  function handleResolveSyncConflict(choice: 'local' | 'cloud' | 'both') {
    if (!syncMergedMap || syncConflicts.length === 0) return;

    const conflict = syncConflicts[0];
    const map = new Map(syncMergedMap);

    if (choice === 'local') {
      map.set(conflict.local.id, conflict.local);
    } else if (choice === 'cloud') {
      map.set(conflict.cloud.id, conflict.cloud);
    } else {
      // Keep both — local stays as-is, cloud gets a new ID as a copy
      map.set(conflict.local.id, conflict.local);
      const copyId = 'book-' + Date.now();
      map.set(copyId, { ...conflict.cloud, id: copyId, title: conflict.cloud.title + ' (cloud)' });
    }

    const remaining = syncConflicts.slice(1);
    if (remaining.length > 0) {
      setSyncMergedMap(map);
      setSyncConflicts(remaining);
    } else {
      // All conflicts resolved — save final merged library
      const mergedBooks = Array.from(map.values());
      isLoadingBookRef.current = true;
      setLibraryBooks(mergedBooks);
      saveLibraryToStorage(mergedBooks);
      setTimeout(() => { isLoadingBookRef.current = false; }, 0);
      setSyncConflicts([]);
      setSyncMergedMap(null);
    }
  }

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
                  onClick={handleOverwriteBook}
                  className="flex-1 px-4 py-2 rounded bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Overwrite
                </button>
                <button
                  onClick={handleSaveAsNewVersion}
                  className="flex-1 px-4 py-2 rounded bg-[#181a1d] dark:bg-[#1a1a1a] text-white text-sm font-medium hover:bg-[#23252a] dark:hover:bg-[#3a3a3a] transition-colors"
                >
                  Save as New
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Document Dialog */}
        {importDialogOpen && (
          <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Import Document</h2>
                <button
                  onClick={() => setImportDialogOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Upload a document to automatically parse chapters and create a new book.
              </p>
              
              <div className="mb-4 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                <input
                  ref={importFileInputRef}
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleImportFileSelect}
                  className="hidden"
                />
                
                <div className="mb-3">
                  <svg className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <button
                  onClick={() => importFileInputRef.current?.click()}
                  disabled={importing}
                  className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Choose File'}
                </button>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Supported: .txt, .doc, .docx, .pdf
                </p>
              </div>
              
              {importError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ExportHistoryPanel
                  exports={exportHistory}
                  isLoading={exportHistoryLoading}
                  onPreviewAction={handlePreviewExport}
                  onDownloadAction={handleDownloadExport}
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
                        <LibraryIcon className="w-5 h-5 dark:[&_path]:stroke-white" />
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
                                setMultiSelectMode(!multiSelectMode);
                                if (multiSelectMode) setSelectedBookIds(new Set());
                              }}
                              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition-colors ${multiSelectMode ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'}`}
                              title={multiSelectMode ? "Cancel selection" : "Select multiple"}
                            >
                              <svg className={`w-4 h-4 ${multiSelectMode ? 'text-blue-600 dark:text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path className={multiSelectMode ? '' : 'dark:stroke-white'} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              <span className={`text-[10px] font-medium ${multiSelectMode ? 'text-blue-600 dark:text-blue-400' : 'text-[#050505] dark:text-[#e5e5e5]'}`}>
                                {multiSelectMode ? 'Cancel' : 'Select'}
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
                            <PlusIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                            <span className="text-[10px] font-medium text-[#050505] dark:text-[#e5e5e5]">New</span>
                          </button>
                          <button
                            onClick={() => {
                              showImportDialog();
                              setMobileSidebarOpen(false);
                            }}
                            className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                            title="Import document"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path className="dark:stroke-white" strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-[10px] font-medium text-[#050505] dark:text-[#e5e5e5]">Import</span>
                          </button>
                        </div>
                        {multiSelectMode && libraryBooks.length > 0 && (
                          <div className="flex items-center justify-between mt-2 px-2 py-1.5 bg-gray-50 dark:bg-[#1a1a1a] rounded-md">
                            <button
                              onClick={toggleSelectAll}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {selectedBookIds.size === libraryBooks.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {selectedBookIds.size} selected
                            </span>
                            <button
                              onClick={handleDeleteSelectedBooks}
                              disabled={selectedBookIds.size === 0}
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
                            const isChecked = selectedBookIds.has(book.id);
                            return (
                              <div
                                key={book.id}
                                className={`group flex items-center justify-between py-2 px-2 rounded transition-colors ${
                                  isSelected || isChecked
                                    ? 'bg-gray-100 dark:bg-[#1a1a1a]'
                                    : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                                }`}
                              >
                                {multiSelectMode && (
                                  <label className="flex items-center mr-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleBookSelection(book.id)}
                                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                                    />
                                  </label>
                                )}
                                <button
                                  onClick={() => multiSelectMode ? toggleBookSelection(book.id) : setSelectedBookId(isSelected ? null : book.id)}
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
                                {!multiSelectMode && isSelected && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        handleLoadBook(book.id);
                                        setSelectedBookId(null);
                                      }}
                                      className="px-2 py-1 text-xs rounded bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
                                      title="Load book"
                                    >
                                      Load
                                    </button>
                                    <button
                                      onClick={() => handleExportLibraryBook(book.id)}
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
                                      onClick={() => handleDeleteBook(book.id)}
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
                        <img src="/preview-icon.svg" alt="Details" className="w-5 h-5 dark:invert flex-shrink-0" />
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
                            onClick={() => handleSaveBook()}
                            disabled={!!saveFeedback}
                            className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-60"
                            title={saveFeedback ? "Saved!" : "Save book"}
                          >
                            {saveFeedback ? (
                              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <SaveIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                            )}
                            <span className={`text-xs font-medium ${saveFeedback ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {saveFeedback ? 'Saved!' : 'Save'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleExportEPUB()}
                            className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
                            title="Export as EPUB"
                          >
                            <DownloadIcon className="w-4 h-4 dark:[&_path]:stroke-white" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">EPUB</span>
                          </button>
                          <button
                            onClick={handleExportPDF}
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
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
                        <img src="/chapters-icon.svg" alt="Chapters" className="w-5 h-5 dark:invert flex-shrink-0" />
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
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
                  <img src="/chapters-icon.svg" alt="Chapters" className="w-5 h-5 dark:invert" />
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
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
          {/* Slim Sidebar Navigation - Desktop Only */}
          <SlimSidebarNav
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
            bookMindHref={`/make-ebook/book-mind${currentBookId ? `?book=${currentBookId}` : ''}`}
          />

          {/* Desktop Sidebar - Hidden on Mobile, animates open/closed */}
            <CollapsibleSidebar
            isPanelOpen={isPanelOpen}
            activeView={sidebarView}
            onClose={() => setSidebarView(null)}
            libraryBooks={libraryBooks}
            selectedBookId={selectedBookId}
            setSelectedBookId={setSelectedBookId}
            handleLoadBook={handleLoadBook}
            handleDeleteBook={handleDeleteBook}
            handleExportLibraryBook={handleExportLibraryBook}
            showNewBookConfirmation={showNewBookConfirmation}
            showImportDialog={showImportDialog}
            multiSelectMode={multiSelectMode}
            setMultiSelectMode={setMultiSelectMode}
            selectedBookIds={selectedBookIds}
            toggleBookSelection={toggleBookSelection}
            toggleSelectAll={toggleSelectAll}
            handleDeleteSelectedBooks={handleDeleteSelectedBooks}
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
            handleSaveBook={handleSaveBook}
            handleExportEPUB={handleExportEPUB}
            handleExportPDF={handleExportPDF}
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
          />

          {/* Main Editor Panel - Mobile Optimised */}
          <main className={`flex-1 flex flex-col bg-white dark:bg-[#0a0a0a] ${chapters.length === 0 ? 'px-0 py-0' : 'px-2 py-8'} ${chapters.length > 0 ? 'lg:pl-8' : 'lg:pl-0'} lg:pr-0 lg:py-0 min-w-0 overflow-x-hidden overflow-y-auto relative`}>
            
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
                    {/* Preview Button */}
                    <button
                      data-tour="mobile-preview"
                      onClick={() => setMobilePreviewOpen(true)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Preview book"
                      title="Preview"
                    >
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3v18" /></svg>
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
                      onClick={() => { saveBookDirectly(false); markClean(); }}
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
                    onCreateEndnote={handleCreateEndnote}
                    chapterId={chapters[selectedChapter]?.id}
                    hasEndnotes={endnotes.length > 0}
                    disabled={!!chapters[selectedChapter]?.locked}
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
                <div className="flex items-center justify-between px-2 mb-2">
                  <div data-tour="auto-save" className="flex items-center gap-2">
                    <AutoSaveIndicator isDirty={isDirty} isSaving={isSaving} lastSaved={lastSaved} hasCloudSync={hasCloudSync} />
                    {isDirty && !isSaving && (
                      <button
                        onClick={() => { saveBookDirectly(false); markClean(); }}
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
                    <button
                      onClick={() => setIsSplitPreviewEnabled(prev => !prev)}
                      className={`p-1.5 rounded transition-colors ${
                        isSplitPreviewEnabled
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title={isSplitPreviewEnabled ? "Hide preview (⌘P)" : "Show preview (⌘P)"}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3v18" />
                      </svg>
                    </button>
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
                <div data-tour="editor" className="w-full max-w-full flex-1 min-h-0 flex flex-col">
                  <div className="mt-2 mb-1 flex-shrink-0 flex items-start justify-between px-2">
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
                      onCreateEndnote={handleCreateEndnote}
                      chapterId={chapters[selectedChapter]?.id}
                      hasEndnotes={endnotes.length > 0}
                      disabled={!!chapters[selectedChapter]?.locked}
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
      {syncConflicts.length > 0 && syncConflicts[0] && (
        <div className="fixed inset-0 z-[150] bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Sync Conflict</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              &ldquo;{syncConflicts[0].local.title || 'Untitled'}&rdquo; was edited on this device and another.
              {syncConflicts.length > 1 && ` (${syncConflicts.length} conflicts)`}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#1a1a1a]">
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">This device</p>
                <p className="text-gray-500 dark:text-gray-400">{syncConflicts[0].local.chapters.length} chapters</p>
                <p className="text-gray-500 dark:text-gray-400">Saved {formatRelativeTime(syncConflicts[0].local.savedAt)}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#1a1a1a]">
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Cloud</p>
                <p className="text-gray-500 dark:text-gray-400">{syncConflicts[0].cloud.chapters.length} chapters</p>
                <p className="text-gray-500 dark:text-gray-400">Saved {formatRelativeTime(syncConflicts[0].cloud.savedAt)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleResolveSyncConflict('cloud')}
                className="w-full px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Keep cloud version
              </button>
              <button
                onClick={() => handleResolveSyncConflict('local')}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Keep this device&apos;s version
              </button>
              <button
                onClick={() => handleResolveSyncConflict('both')}
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
function UserDropdownMobile() {
  const { user, signOut, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="inline-flex rounded-full w-10 h-10 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition px-0" 
          aria-label="User menu"
        >
          <img
            src="/user-icon.svg"
            alt="user icon"
            width={24}
            height={24}
            className="dark:invert"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 z-[150] [&>*]:ml-2" style={{ marginLeft: '8px' }}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Account</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
          <div className="mt-3">
            <SubscriptionBadge showUpgradeButton={true} />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <ManageBillingButton variant="ghost" size="sm" className="w-full justify-start" />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loggingOut}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export page without ProtectedRoute wrapper - the MarketingLandingPage handles auth
export default function MakeEbookPageWrapper() {
  return (
    <Suspense fallback={<div>Loading makeEbook...</div>}>
      <MakeEbookPage />
    </Suspense>
  );
}
