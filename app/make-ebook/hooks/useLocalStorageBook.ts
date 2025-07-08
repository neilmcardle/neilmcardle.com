import { useState, useEffect } from "react";
import type { BookData } from "../types";

const LOCAL_STORAGE_KEY = "makeebook-data";

export function useLocalStorageBook(initial: BookData) {
  const [data, setData] = useState<BookData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  return [data, setData] as const;
}