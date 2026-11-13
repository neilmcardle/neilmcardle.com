import { useCallback, useSyncExternalStore } from "react";
import { readLocal, subscribeLocal, type StorageKey } from "./keys";

const noop = () => {};
const onServer = () => null;

export function useLocalValue(name: StorageKey | null): string | null {
  const key = name?.key ?? null;
  const legacy = name ? name.legacy.join("\0") : "";

  const subscribe = useCallback(
    (listener: () => void) =>
      key === null ? noop : subscribeLocal(key, listener),
    [key],
  );

  const read = useCallback(
    () =>
      key === null
        ? null
        : readLocal({ key, legacy: legacy ? legacy.split("\0") : [] }),
    [key, legacy],
  );

  return useSyncExternalStore(subscribe, read, onServer);
}
