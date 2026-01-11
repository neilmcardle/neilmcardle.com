import { useState, useEffect, useMemo } from 'react';
import { Chapter } from '../types';

export interface QualityIssue {
  id: string;
  severity: 'error' | 'warning' | 'suggestion';
  type: 'metadata' | 'content' | 'typography' | 'formatting' | 'structure' | 'performance';
  message: string;
  chapterId: string;
  chapterTitle: string;
  autoFixable?: boolean;
}

interface QualityValidatorProps {
  chapters: Chapter[];
  title: string;
  author: string;
  coverFile: File | null;
}

export function useQualityValidator({ 
  chapters, 
  title, 
  author, 
  coverFile 
}: QualityValidatorProps) {
  const [issues, setIssues] = useState<QualityIssue[]>([]);

  useEffect(() => {
    const newIssues: QualityIssue[] = [];

    // ========== METADATA CHECKS ==========
    
    if (!title.trim()) {
      newIssues.push({
        id: 'no-title',
        severity: 'error',
        type: 'metadata',
        message: 'Book has no title - required for all eBook stores',
        chapterId: '',
        chapterTitle: 'Metadata',
      });
    }

    if (!author.trim()) {
      newIssues.push({
        id: 'no-author',
        severity: 'error',
        type: 'metadata',
        message: 'Book has no author - required for all eBook stores',
        chapterId: '',
        chapterTitle: 'Metadata',
      });
    }

    if (!coverFile) {
      newIssues.push({
        id: 'no-cover',
        severity: 'warning',
        type: 'metadata',
        message: 'No cover image - books without covers have 50% lower sales',
        chapterId: '',
        chapterTitle: 'Metadata',
      });
    }

    // ========== STRUCTURE CHECKS ==========
    
    const hasContent = chapters.some(ch => ch.type === 'content');
    if (!hasContent) {
      newIssues.push({
        id: 'no-content-chapters',
        severity: 'error',
        type: 'structure',
        message: 'Book has no content chapters - add at least one chapter',
        chapterId: '',
        chapterTitle: 'Structure',
      });
    }

    // ========== CHAPTER CHECKS ==========
    
    chapters.forEach((chapter, index) => {
      const content = chapter.content || '';
      const plainText = content.replace(/<[^>]+>/g, ' ').trim();
      const chapterLabel = chapter.title || `Chapter ${index + 1}`;

      // Empty chapter
      if (!plainText) {
        newIssues.push({
          id: `empty-${chapter.id}`,
          severity: 'warning',
          type: 'content',
          message: 'Chapter is empty',
          chapterId: chapter.id,
          chapterTitle: chapterLabel,
        });
        return; // Skip other checks for empty chapters
      }

      // Very short chapter (less than 100 words)
      const wordCount = plainText.split(/\s+/).filter(Boolean).length;
      if (wordCount > 0 && wordCount < 100) {
        newIssues.push({
          id: `short-${chapter.id}`,
          severity: 'suggestion',
          type: 'content',
          message: `Chapter only has ${wordCount} words - consider expanding or merging`,
          chapterId: chapter.id,
          chapterTitle: chapterLabel,
        });
      }

      // No chapter title
      if (!chapter.title?.trim()) {
        newIssues.push({
          id: `no-title-${chapter.id}`,
          severity: 'suggestion',
          type: 'structure',
          message: 'Chapter has no title',
          chapterId: chapter.id,
          chapterTitle: chapterLabel,
        });
      }

      // ========== TYPOGRAPHY CHECKS ==========
      
      // Double spaces
      if (plainText.includes('  ')) {
        newIssues.push({
          id: `double-space-${chapter.id}`,
          severity: 'suggestion',
          type: 'typography',
          message: 'Contains double spaces - these render inconsistently on e-readers',
          chapterId: chapter.id,
          chapterTitle: chapterLabel,
          autoFixable: true,
        });
      }

      // Straight quotes (should be curly)
      if (/["']/.test(plainText)) {
        newIssues.push({
          id: `straight-quotes-${chapter.id}`,
          severity: 'suggestion',
          type: 'typography',
          message: 'Contains straight quotes - curly quotes ("") look more professional',
          chapterId: chapter.id,
          chapterTitle: chapterLabel,
          autoFixable: true,
        });
      }

      // Double hyphens (should be em-dashes)
      if (/--/.test(plainText)) {
        newIssues.push({
          id: `double-hyphen-${chapter.id}`,
          severity: 'suggestion',
          type: 'typography',
          message: 'Contains double hyphens -- use em-dashes (—) instead',
          chapterId: chapter.id,
          chapterTitle: chapterLabel,
          autoFixable: true,
        });
      }

      // Three dots instead of ellipsis
      if (/\.{3}/.test(plainText)) {
        newIssues.push({
          id: `three-dots-${chapter.id}`,
          severity: 'suggestion',
          type: 'typography',
          message: 'Contains three dots ... use ellipsis character (…) instead',
          chapterId: chapter.id,
          chapterTitle: chapterLabel,
          autoFixable: true,
        });
      }

      // ========== FORMATTING CHECKS ==========
      
      // Multiple consecutive line breaks
      if (/(<br\s*\/?>\s*){3,}/i.test(content)) {
        newIssues.push({
          id: `excess-breaks-${chapter.id}`,
          severity: 'warning',
          type: 'formatting',
          message: 'Multiple blank lines - use scene breaks (***) instead',
          chapterId: chapter.id,
          chapterTitle: chapterLabel,
          autoFixable: true,
        });
      }

      // Inline styles (problematic for e-readers)
      if (/style\s*=\s*["'][^"']+["']/i.test(content)) {
        newIssues.push({
          id: `inline-styles-${chapter.id}`,
          severity: 'warning',
          type: 'formatting',
          message: 'Contains inline styles - may not render consistently across devices',
          chapterId: chapter.id,
          chapterTitle: chapterLabel,
        });
      }

      // ========== PERFORMANCE CHECKS ==========
      
      // Check for large embedded images (base64)
      const base64Matches = content.match(/data:image\/[^;]+;base64,([^"']+)/g);
      if (base64Matches) {
        base64Matches.forEach((match, i) => {
          // Base64 is ~33% larger than binary, so 500KB base64 ≈ 375KB actual
          if (match.length > 500000) {
            newIssues.push({
              id: `large-image-${chapter.id}-${i}`,
              severity: 'warning',
              type: 'performance',
              message: 'Contains a large embedded image - may slow down e-readers',
              chapterId: chapter.id,
              chapterTitle: chapterLabel,
            });
          }
        });
      }
    });

    setIssues(newIssues);
  }, [chapters, title, author, coverFile]);

  // Calculate quality score
  const score = useMemo(() => {
    const errorWeight = 20;
    const warningWeight = 10;
    const suggestionWeight = 2;
    
    const deductions = issues.reduce((sum, issue) => {
      if (issue.severity === 'error') return sum + errorWeight;
      if (issue.severity === 'warning') return sum + warningWeight;
      return sum + suggestionWeight;
    }, 0);

    return Math.max(0, 100 - deductions);
  }, [issues]);

  // Group issues by severity
  const groupedIssues = useMemo(() => {
    return {
      errors: issues.filter(i => i.severity === 'error'),
      warnings: issues.filter(i => i.severity === 'warning'),
      suggestions: issues.filter(i => i.severity === 'suggestion'),
    };
  }, [issues]);

  // Count of auto-fixable issues
  const autoFixableCount = useMemo(() => {
    return issues.filter(i => i.autoFixable).length;
  }, [issues]);

  return { 
    issues, 
    score, 
    groupedIssues, 
    autoFixableCount,
    hasErrors: groupedIssues.errors.length > 0,
    hasWarnings: groupedIssues.warnings.length > 0,
  };
}
