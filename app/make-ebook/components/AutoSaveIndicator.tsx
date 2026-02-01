'use client';

import React from 'react';

interface AutoSaveIndicatorProps {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  compact?: boolean;
}

export function AutoSaveIndicator({ isDirty, isSaving, lastSaved, compact = false }: AutoSaveIndicatorProps) {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isSaving) {
    if (compact) {
      return (
        <div className="flex items-center justify-center w-6 h-6" title="Saving...">
          <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Saving...</span>
      </div>
    );
  }

  if (isDirty) {
    if (compact) {
      return (
        <div className="flex items-center justify-center w-6 h-6" title="Unsaved changes">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  if (lastSaved) {
    if (compact) {
      return (
        <div className="flex items-center justify-center w-6 h-6" title={`Saved ${formatLastSaved(lastSaved)}`}>
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>Saved {formatLastSaved(lastSaved)}</span>
      </div>
    );
  }

  return null;
}

export default AutoSaveIndicator;
