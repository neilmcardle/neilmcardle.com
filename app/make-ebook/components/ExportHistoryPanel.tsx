'use client';

import React, { useState } from 'react';
import { EPUBExportMeta } from '../hooks/useExportHistory';

// Inline format functions to avoid prop serialization issues
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
    minute: '2-digit'
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

interface ExportHistoryPanelProps {
  exports: EPUBExportMeta[];
  isLoading: boolean;
  onPreviewAction: (exportId: string) => void;
  onDownloadAction: (exportId: string) => void;
  onDeleteAction: (exportId: string) => void;
  onClearAllAction: () => void;
}

export function ExportHistoryPanel({
  exports,
  isLoading,
  onPreviewAction,
  onDownloadAction,
  onDeleteAction,
  onClearAllAction,
}: ExportHistoryPanelProps) {
  const [expandedExport, setExpandedExport] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100 rounded-full mx-auto" />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Loading export history...</p>
      </div>
    );
  }

  if (exports.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          No exports yet
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Export your book to EPUB to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Export History
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {exports.length}/5 saved
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Last 5 exports are kept for preview and download
        </p>
      </div>

      {/* Export List */}
      <div className="flex-1 overflow-y-auto">
        {exports.map((exp, index) => {
          const isExpanded = expandedExport === exp.id;
          const isLatest = index === 0;

          return (
            <div
              key={exp.id}
              className={`border-b border-gray-100 dark:border-gray-800 ${
                isExpanded ? 'bg-gray-50 dark:bg-[#1f1f1f]' : ''
              }`}
            >
              {/* Export Header */}
              <button
                onClick={() => setExpandedExport(isExpanded ? null : exp.id)}
                className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatTimestamp(exp.timestamp)}
                      </span>
                      {isLatest && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-700 dark:text-gray-300 truncate mt-0.5">
                      {exp.title}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{exp.wordCount.toLocaleString()} words</span>
                      <span>•</span>
                      <span>{exp.chapterCount} chapters</span>
                      <span>•</span>
                      <span>{formatFileSize(exp.fileSize)}</span>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Actions */}
              {isExpanded && (
                <div className="px-3 pb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onPreviewAction(exp.id);
                        setExpandedExport(null);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview
                    </button>
                    <button
                      onClick={() => onDownloadAction(exp.id)}
                      className="flex-1 py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-300"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={() => onDeleteAction(exp.id)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
                      title="Delete this export"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer with Clear All */}
      {exports.length > 1 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 dark:text-red-400 flex-1">
                Delete all exports?
              </span>
              <button
                onClick={() => {
                  onClearAllAction();
                  setConfirmClear(false);
                }}
                className="px-3 py-1.5 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700"
              >
                Yes, clear all
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 rounded text-xs font-medium border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Clear all export history
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Compact button to show in Book panel header
interface ExportHistoryButtonProps {
  exportCount: number;
  onClickAction: () => void;
}

export function ExportHistoryButton({ exportCount, onClickAction }: ExportHistoryButtonProps) {
  return (
    <button
      onClick={onClickAction}
      className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded transition-colors"
      title="View export history"
    >
      <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {exportCount > 0 && (
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{exportCount}</span>
      )}
    </button>
  );
}

export default ExportHistoryPanel;
