'use client';

import React, { useState } from 'react';
import { BookVersion } from '../hooks/useVersionHistory';
import { EPUBExportMeta } from '../hooks/useExportHistory';
import { Chapter } from '../types';

// Shared helpers. These replace the duplicated copies that used to live in
// VersionHistoryPanel.tsx and ExportHistoryPanel.tsx.
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

type HistoryTab = 'versions' | 'exports';

interface HistoryPanelProps {
  // Modal
  onClose: () => void;
  initialTab?: HistoryTab;

  // Versions
  versions: BookVersion[];
  currentWordCount: number;
  onRestoreVersion: (chapters: Chapter[], metadata: BookVersion['metadata']) => void;
  onDeleteVersion: (versionId: string) => void;
  onClearAllVersions: () => void;

  // Exports
  exports: EPUBExportMeta[];
  exportsLoading: boolean;
  onPreviewExport: (exportId: string) => void;
  onDownloadExport: (exportId: string) => void;
  onDeleteExport: (exportId: string) => void;
  onClearAllExports: () => void;
}

export default function HistoryPanel({
  onClose,
  initialTab = 'versions',
  versions,
  currentWordCount,
  onRestoreVersion,
  onDeleteVersion,
  onClearAllVersions,
  exports,
  exportsLoading,
  onPreviewExport,
  onDownloadExport,
  onDeleteExport,
  onClearAllExports,
}: HistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>(initialTab);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Resetting expansion / confirm state when switching tabs prevents stale
  // "yes, clear all" prompts or expanded rows from one tab leaking into the
  // other.
  const switchTab = (next: HistoryTab) => {
    if (next === activeTab) return;
    setActiveTab(next);
    setExpandedId(null);
    setConfirmClear(false);
  };

  return (
    <div className="fixed inset-0 z-[130] bg-black/20 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">History</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-[#2f2f2f]" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'versions'}
            onClick={() => switchTab('versions')}
            className={`flex-1 px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
              activeTab === 'versions'
                ? 'text-gray-900 dark:text-[#f5f5f5] border-b-2 border-gray-900 dark:border-[#f5f5f5] -mb-px'
                : 'text-gray-500 dark:text-[#a3a3a3] hover:text-gray-700 dark:hover:text-[#d4d4d4]'
            }`}
          >
            Versions
            {versions.length > 0 && <span className="ml-1.5 text-gray-400 dark:text-[#666]">{versions.length}</span>}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'exports'}
            onClick={() => switchTab('exports')}
            className={`flex-1 px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
              activeTab === 'exports'
                ? 'text-gray-900 dark:text-[#f5f5f5] border-b-2 border-gray-900 dark:border-[#f5f5f5] -mb-px'
                : 'text-gray-500 dark:text-[#a3a3a3] hover:text-gray-700 dark:hover:text-[#d4d4d4]'
            }`}
          >
            Exports
            {exports.length > 0 && <span className="ml-1.5 text-gray-400 dark:text-[#666]">{exports.length}</span>}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'versions' ? (
            <VersionsTab
              versions={versions}
              currentWordCount={currentWordCount}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              onRestore={(chapters, metadata) => {
                onRestoreVersion(chapters, metadata);
                setExpandedId(null);
              }}
              onDelete={onDeleteVersion}
            />
          ) : (
            <ExportsTab
              exports={exports}
              isLoading={exportsLoading}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              onPreview={(id) => {
                onPreviewExport(id);
                setExpandedId(null);
              }}
              onDownload={onDownloadExport}
              onDelete={onDeleteExport}
            />
          )}
        </div>

        {/* Footer — clear all, scoped to active tab */}
        {activeTab === 'versions' && versions.length > 1 && (
          <ClearAllFooter
            label="Clear all version history"
            confirmLabel="Delete all versions?"
            confirmClear={confirmClear}
            setConfirmClear={setConfirmClear}
            onConfirm={onClearAllVersions}
          />
        )}
        {activeTab === 'exports' && exports.length > 1 && (
          <ClearAllFooter
            label="Clear all export history"
            confirmLabel="Delete all exports?"
            confirmClear={confirmClear}
            setConfirmClear={setConfirmClear}
            onConfirm={onClearAllExports}
          />
        )}
      </div>
    </div>
  );
}

// ─── Versions tab ────────────────────────────────────────────────────────────

function VersionsTab({
  versions,
  currentWordCount,
  expandedId,
  setExpandedId,
  onRestore,
  onDelete,
}: {
  versions: BookVersion[];
  currentWordCount: number;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onRestore: (chapters: Chapter[], metadata: BookVersion['metadata']) => void;
  onDelete: (versionId: string) => void;
}) {
  if (versions.length === 0) {
    return (
      <EmptyState
        title="No version history yet"
        description="Versions are saved automatically when you save your book."
      />
    );
  }

  return (
    <div>
      {versions.map((version, index) => {
        const isExpanded = expandedId === version.id;
        const wordDiff = version.wordCount - currentWordCount;
        const isLatest = index === 0;

        return (
          <div
            key={version.id}
            className={`border-b border-gray-100 dark:border-[#2f2f2f] ${isExpanded ? 'bg-gray-50 dark:bg-[#1f1f1f]' : ''}`}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : version.id)}
              className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-[#f5f5f5]">
                      {formatTimestamp(version.timestamp)}
                    </span>
                    {isLatest && <LatestPill tone="green" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-[#a3a3a3]">
                    <span>{version.wordCount.toLocaleString()} words</span>
                    <span>•</span>
                    <span>{version.chapterCount} chapters</span>
                  </div>
                </div>
                <Chevron expanded={isExpanded} />
              </div>
            </button>

            {isExpanded && (
              <div className="px-3 pb-3">
                {wordDiff !== 0 && (
                  <div
                    className={`text-xs mb-2 ${
                      wordDiff > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {wordDiff > 0
                      ? `${wordDiff.toLocaleString()} fewer words than current`
                      : `${Math.abs(wordDiff).toLocaleString()} more words than current`}
                  </div>
                )}

                <div className="bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-[#2f2f2f] p-2 mb-3">
                  <div className="text-xs text-gray-500 dark:text-[#a3a3a3] mb-1">Chapters:</div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {version.chapters.slice(0, 5).map((ch, i) => (
                      <div key={ch.id} className="text-xs text-gray-700 dark:text-[#d4d4d4] truncate">
                        {i + 1}. {ch.title || 'Untitled Chapter'}
                      </div>
                    ))}
                    {version.chapters.length > 5 && (
                      <div className="text-xs text-gray-400">+{version.chapters.length - 5} more...</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onRestore(version.chapters, version.metadata)}
                    className="flex-1 py-2 px-3 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Restore This Version
                  </button>
                  <button
                    onClick={() => onDelete(version.id)}
                    className="p-2 rounded-lg border border-gray-200 dark:border-[#2f2f2f] text-gray-500 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
                    title="Delete this version"
                    aria-label="Delete this version"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Exports tab ─────────────────────────────────────────────────────────────

function ExportsTab({
  exports,
  isLoading,
  expandedId,
  setExpandedId,
  onPreview,
  onDownload,
  onDelete,
}: {
  exports: EPUBExportMeta[];
  isLoading: boolean;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onPreview: (exportId: string) => void;
  onDownload: (exportId: string) => void;
  onDelete: (exportId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-900 dark:border-[#3a3a3a] dark:border-t-gray-100 rounded-full mx-auto" />
        <p className="text-xs text-gray-500 dark:text-[#a3a3a3] mt-2">Loading export history...</p>
      </div>
    );
  }

  if (exports.length === 0) {
    return (
      <EmptyState
        title="No exports yet"
        description="Export your book to EPUB to see it here."
      />
    );
  }

  return (
    <div>
      {exports.map((exp, index) => {
        const isExpanded = expandedId === exp.id;
        const isLatest = index === 0;

        return (
          <div
            key={exp.id}
            className={`border-b border-gray-100 dark:border-[#2f2f2f] ${isExpanded ? 'bg-gray-50 dark:bg-[#1f1f1f]' : ''}`}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : exp.id)}
              className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-[#f5f5f5]">
                      {formatTimestamp(exp.timestamp)}
                    </span>
                    {isLatest && <LatestPill tone="blue" />}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-[#d4d4d4] truncate mt-0.5">{exp.title}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-[#a3a3a3]">
                    <span>{exp.wordCount.toLocaleString()} words</span>
                    <span>•</span>
                    <span>{exp.chapterCount} chapters</span>
                    <span>•</span>
                    <span>{formatFileSize(exp.fileSize)}</span>
                  </div>
                </div>
                <Chevron expanded={isExpanded} />
              </div>
            </button>

            {isExpanded && (
              <div className="px-3 pb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onPreview(exp.id)}
                    className="flex-1 py-2 px-3 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </button>
                  <button
                    onClick={() => onDownload(exp.id)}
                    className="flex-1 py-2 px-3 rounded-lg border border-gray-200 dark:border-[#2f2f2f] text-xs font-medium hover:bg-gray-50 dark:hover:bg-[#2f2f2f] transition-colors flex items-center justify-center gap-1.5 text-gray-700 dark:text-[#d4d4d4]"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={() => onDelete(exp.id)}
                    className="p-2 rounded-lg border border-gray-200 dark:border-[#2f2f2f] text-gray-500 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
                    title="Delete this export"
                    aria-label="Delete this export"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Shared pieces ──────────────────────────────────────────────────────────

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-[#262626] flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-[#f5f5f5] mb-1">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">{description}</p>
    </div>
  );
}

function LatestPill({ tone }: { tone: 'green' | 'blue' }) {
  const classes =
    tone === 'green'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
  return <span className={`text-2xs px-1.5 py-0.5 rounded ${classes}`}>Latest</span>;
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function ClearAllFooter({
  label,
  confirmLabel,
  confirmClear,
  setConfirmClear,
  onConfirm,
}: {
  label: string;
  confirmLabel: string;
  confirmClear: boolean;
  setConfirmClear: (v: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="p-3 border-t border-gray-200 dark:border-[#2f2f2f]">
      {confirmClear ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-600 dark:text-red-400 flex-1">{confirmLabel}</span>
          <button
            onClick={() => {
              onConfirm();
              setConfirmClear(false);
            }}
            className="px-3 py-1.5 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700"
          >
            Yes, clear all
          </button>
          <button
            onClick={() => setConfirmClear(false)}
            className="px-3 py-1.5 rounded text-xs font-medium border border-gray-200 dark:border-[#2f2f2f] hover:bg-gray-100 dark:hover:bg-[#2f2f2f]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmClear(true)}
          className="w-full py-2 text-xs text-gray-500 dark:text-[#a3a3a3] hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          {label}
        </button>
      )}
    </div>
  );
}

// ─── Toolbar button ─────────────────────────────────────────────────────────

interface HistoryButtonProps {
  versionCount: number;
  exportCount: number;
  onClickAction: () => void;
}

export function HistoryButton({ versionCount, exportCount, onClickAction }: HistoryButtonProps) {
  const total = versionCount + exportCount;
  return (
    <button
      onClick={onClickAction}
      className="flex items-center gap-1.5 px-3 h-10 rounded-lg text-xs font-medium bg-gray-100 dark:bg-[#262626] text-gray-700 dark:text-[#d4d4d4] hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition-colors"
      title="View version and export history"
      aria-label="History"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {total > 0 && <span>{total}</span>}
    </button>
  );
}
