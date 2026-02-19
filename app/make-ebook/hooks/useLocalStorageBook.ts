import { useState, useEffect } from "react";
import type { BookData } from "../types";

const LOCAL_STORAGE_KEY = "makeebook-data";

export function useLocalStorageBook(initial: BookData, userId?: string) {
  const storageKey = `${userId ? userId + '_' : ''}${LOCAL_STORAGE_KEY}`;

  const [data, setData] = useState<BookData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  return [data, setData] as const;
}