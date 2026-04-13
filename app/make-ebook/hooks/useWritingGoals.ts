'use client';

import { useMemo } from 'react';

// Intentionally stripped of streaks, daily targets, and week history. A quiet
// "N words today" nudge is the only surface this hook needs to feed. The
// per-day word count is written by useWordStats into localStorage under the
// `${userId}_makeebook-words-YYYY-MM-DD` key; we just read today's value.
export interface WritingGoals {
  todayWords: number;
}

function wordsKey(userId: string | undefined, date: string) {
  return `${userId || ''}_makeebook-words-${date}`;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function useWritingGoals({
  userId,
  wordsThisSession = 0,
}: {
  userId?: string;
  wordsThisSession?: number;
}): WritingGoals {
  const todayWords = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(wordsKey(userId, todayStr())) || '0', 10);
    // wordsThisSession is in the deps so the value re-reads as the user writes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordsThisSession, userId]);

  return { todayWords };
}
