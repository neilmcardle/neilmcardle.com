"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { Chapter } from "../types";
import { keys, readLocal, writeLocal } from "../storage/keys";
import { textStats } from "../model/text";

interface ChapterStats {
  id: string;
  title: string;
  wordCount: number;
  charCount: number;
  readingTime: number;
}

interface BookStats {
  totalWords: number;
  totalChars: number;
  totalReadingTime: number;
  chapterStats: ChapterStats[];
  averageWordsPerChapter: number;
}

interface SessionStats {
  wordsWrittenToday: number;
  sessionStartWords: number;
  wordsThisSession: number;
  sessionStartTime: Date;
}

const WORDS_PER_MINUTE = 225;

const COUNT_CACHE_SIZE = 200;
const countCache = new Map<string, { words: number; chars: number }>();

function countContent(html: string) {
  const hit = countCache.get(html);
  if (hit) return hit;
  const { words, chars } = textStats(html);
  const counts = { words, chars };
  countCache.set(html, counts);
  if (countCache.size > COUNT_CACHE_SIZE) {
    countCache.delete(countCache.keys().next().value as string);
  }
  return counts;
}

function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function useWordStats(chapters: Chapter[], userId?: string) {
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    wordsWrittenToday: 0,
    sessionStartWords: 0,
    wordsThisSession: 0,
    sessionStartTime: new Date(),
  });

  const initializedRef = useRef(false);

  const bookStats: BookStats = useMemo(() => {
    const chapterStats: ChapterStats[] = chapters.map((chapter) => {
      const { words: wordCount, chars: charCount } = countContent(
        chapter.content,
      );
      return {
        id: chapter.id,
        title: chapter.title || "Untitled Chapter",
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
      averageWordsPerChapter:
        chapters.length > 0 ? Math.round(totalWords / chapters.length) : 0,
    };
  }, [chapters]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const todayKey = getTodayKey();
    const storedData = readLocal(keys.wordsToday(userId, todayKey));
    const wordsWrittenToday = storedData ? parseInt(storedData, 10) : 0;

    setSessionStats({
      wordsWrittenToday,
      sessionStartWords: bookStats.totalWords,
      wordsThisSession: 0,
      sessionStartTime: new Date(),
    });
  }, []);

  useEffect(() => {
    if (!initializedRef.current) return;

    const wordsThisSession = Math.max(
      0,
      bookStats.totalWords - sessionStats.sessionStartWords,
    );
    const todayKey = getTodayKey();
    const newTodayTotal = sessionStats.wordsWrittenToday + wordsThisSession;
    writeLocal(keys.wordsToday(userId, todayKey), newTodayTotal.toString());

    setSessionStats((prev) => ({
      ...prev,
      wordsThisSession,
    }));
  }, [bookStats.totalWords]);

  const formatReadingTime = (minutes: number): string => {
    if (minutes < 1) return "< 1 min";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

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
