"use client";

import { useCallback, useMemo, useState } from "react";

export function useChapterSelection(chapterIds: string[]) {
  const [active, setActive] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(() => new Set());

  const selected = useMemo(() => {
    const present = new Set(chapterIds);
    return new Set([...picked].filter((id) => present.has(id)));
  }, [picked, chapterIds]);

  const toggle = useCallback((id: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(
    () => setPicked(new Set(chapterIds)),
    [chapterIds],
  );
  const clear = useCallback(() => setPicked(new Set()), []);
  const start = useCallback(() => setActive(true), []);
  const stop = useCallback(() => {
    setActive(false);
    setPicked(new Set());
  }, []);

  return {
    active,
    selected,
    count: selected.size,
    allSelected: chapterIds.length > 0 && selected.size === chapterIds.length,
    toggle,
    selectAll,
    clear,
    start,
    stop,
  };
}

export type ChapterSelection = ReturnType<typeof useChapterSelection>;
