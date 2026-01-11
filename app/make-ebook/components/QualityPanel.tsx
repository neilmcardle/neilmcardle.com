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
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-medium">No issues found!</p>
        <p className="text-sm">Your eBook is ready for publishing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.error && grouped.error.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Errors ({grouped.error.length})
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
          <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Warnings ({grouped.warning.length})
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
          <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Suggestions ({grouped.suggestion.length})
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
  return (
    <button
      onClick={() => issue.chapterId && onNavigateAction(issue.chapterId)}
      disabled={!issue.chapterId}
      className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#333] transition-colors disabled:cursor-default"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {issue.message}
          </div>
          {issue.chapterTitle && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              in "{issue.chapterTitle}"
            </div>
          )}
        </div>
        {issue.autoFixable && (
          <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            Auto-fix
          </span>
        )}
      </div>
    </button>
  );
}

interface QualityPanelProps {
  issues: QualityIssue[];
  score: number;
  autoFixableCount: number;
  onNavigateToChapterAction: (chapterId: string) => void;
  onAutoFixAllAction: () => void;
}

export function QualityPanel({
  issues,
  score,
  autoFixableCount,
  onNavigateToChapterAction,
  onAutoFixAllAction,
}: QualityPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          eBook Quality
        </h3>
        <QualityScoreBadge score={score} compact />
      </div>
      
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Catch formatting issues before readers do. A high-quality eBook leads to 
        better reviews and fewer returns.
      </p>
      
      {autoFixableCount > 0 && (
        <button
          onClick={onAutoFixAllAction}
          className="w-full py-2 px-4 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Auto-Fix {autoFixableCount} Typography Issues
        </button>
      )}
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <QualityIssuesList 
          issues={issues} 
          onNavigateAction={onNavigateToChapterAction}
        />
      </div>
    </div>
  );
}

// Interactive dropdown component that combines badge + panel
interface QualityDropdownProps {
  score: number;
  issues: QualityIssue[];
  autoFixableCount: number;
  onNavigateToChapterAction: (chapterId: string) => void;
  onAutoFixAllAction: () => void;
}

export function QualityDropdown({
  score,
  issues,
  autoFixableCount,
  onNavigateToChapterAction,
  onAutoFixAllAction,
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
      className="fixed max-h-96 overflow-y-auto bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-200 dark:border-[#333] z-[9999]"
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
        autoFixableCount={autoFixableCount}
        onNavigateToChapterAction={(chapterId) => {
          onNavigateToChapterAction(chapterId);
          setIsOpen(false);
        }}
        onAutoFixAllAction={() => {
          onAutoFixAllAction();
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
