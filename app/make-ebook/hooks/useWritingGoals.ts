'use client';

import { useMemo, useEffect, useState } from 'react';

export interface DayHistory {
  date: string; // YYYY-MM-DD
  words: number;
  metGoal: boolean;
}

export interface WritingGoals {
  dailyTarget: number;
  setDailyTarget: (n: number) => void;
  currentStreak: number;
  longestStreak: number;
  todayWords: number;
  progressPercent: number;
  goalMet: boolean;
  weekHistory: DayHistory[];
}

function goalKey(userId?: string) {
  return `${userId || 'anon'}_makeebook-daily-goal`;
}

function wordsKey(userId: string | undefined, date: string) {
  return `${userId || ''}_makeebook-words-${date}`;
}

function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function readWords(userId: string | undefined, date: string): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(wordsKey(userId, date)) || '0', 10);
}

export function useWritingGoals({
  userId,
  wordsThisSession = 0,
}: {
  userId?: string;
  wordsThisSession?: number;
}): WritingGoals {
  const [dailyTarget, setDailyTargetState] = useState(500);

  // Load saved goal on mount / userId change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(goalKey(userId));
    if (stored) {
      const n = parseInt(stored, 10);
      if (!isNaN(n) && n > 0) setDailyTargetState(n);
    }
  }, [userId]);

  const setDailyTarget = (n: number) => {
    const clamped = Math.max(1, Math.min(100_000, n));
    setDailyTargetState(clamped);
    if (typeof window !== 'undefined') {
      localStorage.setItem(goalKey(userId), String(clamped));
    }
  };

  // Today's words — re-derived whenever wordsThisSession changes (useWordStats keeps key up to date)
  const todayWords = useMemo(() => {
    return readWords(userId, getDateStr(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordsThisSession, userId]);

  const { currentStreak, longestStreak, weekHistory } = useMemo(() => {
    if (typeof window === 'undefined') {
      return { currentStreak: 0, longestStreak: 0, weekHistory: [] };
    }

    // Build last 7 days history
    const weekHistory: DayHistory[] = Array.from({ length: 7 }, (_, i) => {
      const date = getDateStr(6 - i); // oldest first
      const words = readWords(userId, date);
      return { date, words, metGoal: dailyTarget > 0 && words >= dailyTarget };
    });

    // Streak: walk backwards from today counting days with any writing
    let currentStreak = 0;
    const todayW = readWords(userId, getDateStr(0));
    if (todayW > 0) currentStreak = 1;

    for (let i = 1; i <= 365; i++) {
      const w = readWords(userId, getDateStr(i));
      if (w > 0) currentStreak++;
      else break;
    }

    // Longest streak over past 60 days
    let longestStreak = 0;
    let run = 0;
    for (let i = 59; i >= 0; i--) {
      const w = readWords(userId, getDateStr(i));
      if (w > 0) {
        run++;
        if (run > longestStreak) longestStreak = run;
      } else {
        run = 0;
      }
    }

    return { currentStreak, longestStreak, weekHistory };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, wordsThisSession, dailyTarget]);

  const progressPercent = dailyTarget > 0 ? Math.min(100, (todayWords / dailyTarget) * 100) : 0;
  const goalMet = dailyTarget > 0 && todayWords >= dailyTarget;

  return {
    dailyTarget,
    setDailyTarget,
    currentStreak,
    longestStreak,
    todayWords,
    progressPercent,
    goalMet,
    weekHistory,
  };
}
