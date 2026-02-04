'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { QualityIssue } from '../hooks/useQualityValidator';

interface QualityScoreBadgeProps {
  score: number;
  compact?: boolean;
}

export function QualityScoreBadge({ score, compact = false }: QualityScoreBadgeProps) {
  const getColor = () => {
    if (score >= 90) return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
  };

  const getLabel = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
  };

  const getIcon = () => {
    if (score >= 90) {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (score >= 70) {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getColor()}`}>
        <span className="w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center">{getIcon()}</span>
        <span>{score}%</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getColor()}`}>
      {getIcon()}
      <span>Quality: {score}% ({getLabel()})</span>
    </div>
  );
}

interface QualityIssuesListProps {
  issues: QualityIssue[];
  onNavigateAction: (chapterId: string) => void;
}

export function QualityIssuesList({ issues, onNavigateAction }: QualityIssuesListProps) {
  const grouped = issues.reduce((acc, issue) => {
    if (!acc[issue.severity]) acc[issue.severity] = [];
    acc[issue.severity].push(issue);
    return acc;
  }, {} as Record<string, QualityIssue[]>);

  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {grouped.error && grouped.error.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Must Fix ({grouped.error.length})
          </h4>
          <div className="space-y-2">
            {grouped.error.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onNavigateAction={onNavigateAction} />
            ))}
          </div>
        </div>
      )}
      
      {grouped.warning && grouped.warning.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Should Fix ({grouped.warning.length})
          </h4>
          <div className="space-y-2">
            {grouped.warning.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onNavigateAction={onNavigateAction} />
            ))}
          </div>
        </div>
      )}
      
      {grouped.suggestion && grouped.suggestion.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Consider ({grouped.suggestion.length})
          </h4>
          <div className="space-y-2">
            {grouped.suggestion.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onNavigateAction={onNavigateAction} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface IssueCardProps {
  issue: QualityIssue;
  onNavigateAction: (chapterId: string) => void;
}

function IssueCard({ issue, onNavigateAction }: IssueCardProps) {
  const canNavigate = !!issue.chapterId;
  
  return (
    <button
      onClick={() => issue.chapterId && onNavigateAction(issue.chapterId)}
      disabled={!canNavigate}
      className={`w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] transition-colors ${
        canNavigate 
          ? 'hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer' 
          : 'cursor-default'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {issue.message}
        </div>
        {issue.hint && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-start gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>{issue.hint}</span>
          </div>
        )}
        {issue.chapterTitle && canNavigate && (
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 flex items-center gap-1 font-medium">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>Go to "{issue.chapterTitle}"</span>
          </div>
        )}
      </div>
    </button>
  );
}

interface QualityPanelProps {
  issues: QualityIssue[];
  score: number;
  onNavigateToChapterAction: (chapterId: string) => void;
}

export function QualityPanel({
  issues,
  score,
  onNavigateToChapterAction,
}: QualityPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          eBook Quality Check
        </h3>
        <QualityScoreBadge score={score} compact />
      </div>
      
      {issues.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium text-sm">No issues found!</p>
          <p className="text-xs mt-1">Your eBook is ready for export.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Click an issue to jump to that chapter and fix it.
          </p>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <QualityIssuesList 
              issues={issues} 
              onNavigateAction={onNavigateToChapterAction}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Interactive dropdown component that combines badge + panel
interface QualityDropdownProps {
  score: number;
  issues: QualityIssue[];
  onNavigateToChapterAction: (chapterId: string) => void;
}

export function QualityDropdown({
  score,
  issues,
  onNavigateToChapterAction,
}: QualityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, isMobile: false });

  // Client-side only for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      const viewportWidth = window.innerWidth;
      const dropdownWidth = isMobile ? viewportWidth - 24 : 320;
      
      // On mobile, center the dropdown. On desktop, align to button right edge
      let left: number;
      if (isMobile) {
        // Center horizontally on mobile
        left = 12;
      } else {
        left = Math.min(rect.right - dropdownWidth, viewportWidth - dropdownWidth - 12);
      }
      
      setPosition({
        top: rect.bottom + 8,
        left,
        isMobile,
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownContent = isOpen && mounted ? createPortal(
    <div 
      ref={dropdownRef}
      className="fixed max-h-96 overflow-y-auto bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-[9999]"
      style={{ 
        top: position.top, 
        left: position.left,
        width: position.isMobile ? 'calc(100vw - 24px)' : '320px',
        maxWidth: '360px',
      }}
    >
      <QualityPanel
        issues={issues}
        score={score}
        onNavigateToChapterAction={(chapterId) => {
          onNavigateToChapterAction(chapterId);
          setIsOpen(false);
        }}
      />
    </div>,
    document.body
  ) : null;

  return (
    <>
      {/* Clickable Badge */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
        title="Click to view quality issues"
      >
        <QualityScoreBadge score={score} compact />
        <svg 
          className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {dropdownContent}
    </>
  );
}

export default QualityPanel;
