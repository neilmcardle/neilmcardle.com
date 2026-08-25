"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const mql = useMemo(
    () => (typeof window === "undefined" ? null : window.matchMedia(query)),
    [query],
  );

  const subscribe = useCallback(
    (listener: () => void) => {
      if (!mql) return () => {};
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    },
    [mql],
  );

  return useSyncExternalStore(
    subscribe,
    () => (mql ? mql.matches : false),
    () => false,
  );
}
