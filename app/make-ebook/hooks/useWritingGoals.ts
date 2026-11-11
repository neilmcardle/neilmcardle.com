"use client";

import { useMemo } from "react";
import { keys, readLocal } from "../storage/keys";

export interface WritingGoals {
  todayWords: number;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function useWritingGoals({
  userId,
  wordsThisSession = 0,
}: {
  userId?: string;
  wordsThisSession?: number;
}): WritingGoals {
  const todayWords = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return wordsThisSession >= 0
      ? parseInt(readLocal(keys.wordsToday(userId, todayStr())) || "0", 10)
      : 0;
  }, [wordsThisSession, userId]);

  return { todayWords };
}
