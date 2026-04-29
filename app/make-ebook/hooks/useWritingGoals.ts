'use client';

import { useMemo } from 'react';

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
