'use client';

import React, { useState } from 'react';
import { BookVersion } from '../hooks/useVersionHistory';
import { Chapter } from '../types';

// Inline format function to avoid prop serialization issues
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
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

interface VersionHistoryPanelProps {
  versions: BookVersion[];
  currentWordCount: number;
  onRestoreAction: (chapters: Chapter[], metadata: BookVersion['metadata']) => void;
  onDeleteAction: (versionId: string) => void;
  onClearAllAction: () => void;
}

export function VersionHistoryPanel({
  versions,
  currentWordCount,
  onRestoreAction,
  onDeleteAction,
  onClearAllAction,
}: VersionHistoryPanelProps) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (versions.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          No version history yet
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Versions are saved automatically when you save your book.
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
            Version History
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {versions.length} saved
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Click any version to preview and restore
        </p>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto">
        {versions.map((version, index) => {
          const isExpanded = expandedVersion === version.id;
          const wordDiff = version.wordCount - currentWordCount;
          const isLatest = index === 0;

          return (
            <div
              key={version.id}
              className={`border-b border-gray-100 dark:border-gray-800 ${
                isExpanded ? 'bg-gray-50 dark:bg-[#1f1f1f]' : ''
              }`}
            >
              {/* Version Header */}
              <button
                onClick={() => setExpandedVersion(isExpanded ? null : version.id)}
                className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatTimestamp(version.timestamp)}
                      </span>
                      {isLatest && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{version.wordCount.toLocaleString()} words</span>
                      <span>•</span>
                      <span>{version.chapterCount} chapters</span>
                    </div>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-3 pb-3">
                  {/* Word count comparison */}
                  {wordDiff !== 0 && (
                    <div className={`text-xs mb-2 ${
                      wordDiff > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {wordDiff > 0 ? `${wordDiff.toLocaleString()} fewer words than current` : `${Math.abs(wordDiff).toLocaleString()} more words than current`}
                    </div>
                  )}

                  {/* Chapter Preview */}
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-gray-800 p-2 mb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chapters:</div>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {version.chapters.slice(0, 5).map((ch, i) => (
                        <div key={ch.id} className="text-xs text-gray-700 dark:text-gray-300 truncate">
                          {i + 1}. {ch.title || 'Untitled Chapter'}
                        </div>
                      ))}
                      {version.chapters.length > 5 && (
                        <div className="text-xs text-gray-400">
                          +{version.chapters.length - 5} more...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onRestoreAction(version.chapters, version.metadata);
                        setExpandedVersion(null);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Restore This Version
                    </button>
                    <button
                      onClick={() => onDeleteAction(version.id)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
                      title="Delete this version"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
      {versions.length > 1 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 dark:text-red-400 flex-1">
                Delete all versions?
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
              Clear all version history
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Compact button to show in toolbar
interface VersionHistoryButtonProps {
  versionCount: number;
  onClickAction: () => void;
}

export function VersionHistoryButton({ versionCount, onClickAction }: VersionHistoryButtonProps) {
  return (
    <button
      onClick={onClickAction}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title="View version history"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{versionCount}</span>
    </button>
  );
}

export default VersionHistoryPanel;
