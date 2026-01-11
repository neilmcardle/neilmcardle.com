'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import { Chapter } from '../types';

interface ChapterStats {
  id: string;
  title: string;
  wordCount: number;
  charCount: number;
  readingTime: number; // minutes
}

interface BookStats {
  totalWords: number;
  totalChars: number;
  totalReadingTime: number; // minutes
  chapterStats: ChapterStats[];
  averageWordsPerChapter: number;
}

interface SessionStats {
  wordsWrittenToday: number;
  sessionStartWords: number;
  wordsThisSession: number;
  sessionStartTime: Date;
}

// Average reading speed: 200-250 words per minute
const WORDS_PER_MINUTE = 225;

// Strip HTML and count words
function countWords(html: string): number {
  if (!html) return 0;
  
  // Remove HTML tags
  const text = html.replace(/<[^>]+>/g, ' ');
  
  // Remove extra whitespace and split by whitespace
  const words = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(word => word.length > 0);
  
  return words.length;
}

function countChars(html: string): number {
  if (!html) return 0;
  
  // Remove HTML tags and count remaining characters (excluding spaces)
  const text = html.replace(/<[^>]+>/g, '');
  return text.replace(/\s/g, '').length;
}

function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}

// Get today's date key for localStorage
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function useWordStats(chapters: Chapter[]) {
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    wordsWrittenToday: 0,
    sessionStartWords: 0,
    wordsThisSession: 0,
    sessionStartTime: new Date(),
  });
  
  const initializedRef = useRef(false);

  // Calculate book stats
  const bookStats: BookStats = useMemo(() => {
    const chapterStats: ChapterStats[] = chapters.map(chapter => {
      const wordCount = countWords(chapter.content);
      const charCount = countChars(chapter.content);
      return {
        id: chapter.id,
        title: chapter.title || 'Untitled Chapter',
        wordCount,
        charCount,
        readingTime: calculateReadingTime(wordCount),
      };
    });

    const totalWords = chapterStats.reduce((sum, ch) => sum + ch.wordCount, 0);
    const totalChars = chapterStats.reduce((sum, ch) => sum + ch.charCount, 0);

    return {
      totalWords,
      totalChars,
      totalReadingTime: calculateReadingTime(totalWords),
      chapterStats,
      averageWordsPerChapter: chapters.length > 0 
        ? Math.round(totalWords / chapters.length) 
        : 0,
    };
  }, [chapters]);

  // Initialize session tracking
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const todayKey = getTodayKey();
    const storageKey = `makeebook-words-${todayKey}`;
    
    // Load today's word count from localStorage
    const storedData = localStorage.getItem(storageKey);
    const wordsWrittenToday = storedData ? parseInt(storedData, 10) : 0;
    
    setSessionStats({
      wordsWrittenToday,
      sessionStartWords: bookStats.totalWords,
      wordsThisSession: 0,
      sessionStartTime: new Date(),
    });
  }, []);

  // Track words written this session
  useEffect(() => {
    if (!initializedRef.current) return;

    const wordsThisSession = Math.max(0, bookStats.totalWords - sessionStats.sessionStartWords);
    const todayKey = getTodayKey();
    const storageKey = `makeebook-words-${todayKey}`;
    
    // Update localStorage with today's total
    const newTodayTotal = sessionStats.wordsWrittenToday + wordsThisSession;
    localStorage.setItem(storageKey, newTodayTotal.toString());
    
    setSessionStats(prev => ({
      ...prev,
      wordsThisSession,
    }));
  }, [bookStats.totalWords]);

  // Format reading time for display
  const formatReadingTime = (minutes: number): string => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Format word count with commas
  const formatWordCount = (count: number): string => {
    return count.toLocaleString();
  };

  return {
    bookStats,
    sessionStats,
    formatReadingTime,
    formatWordCount,
  };
}

export type { BookStats, ChapterStats, SessionStats };
