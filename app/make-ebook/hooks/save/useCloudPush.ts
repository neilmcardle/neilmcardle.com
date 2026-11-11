"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { loadBookLibrary } from "../../utils/bookLibrary";
import { pushStored } from "../../storage/cloudStore";
import { createSingleFlight } from "../../state/singleFlight";
import type { DialogConfig } from "../../state/overlays";

const CLOUD_IDLE_MS = 10000;
const CLOUD_MAX_WAIT_MS = 30000;

interface Params {
  user: { id: string } | null;
  hasCloudSync: boolean;
  setLibraryBooks: (books: any[]) => void;
  setDialogState: React.Dispatch<React.SetStateAction<DialogConfig>>;
}

export function useCloudPush({
  user,
  hasCloudSync,
  setLibraryBooks,
  setDialogState,
}: Params) {
  const cloudErrorShownRef = useRef(false);
  const cloudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudPendingSinceRef = useRef(0);
  const cloudFailuresRef = useRef(0);
  const cloudPendingIdRef = useRef<string | null>(null);
  const flushCloudRef = useRef<() => void>(() => {});
  const [cloudPending, setCloudPending] = useState(false);
  const pushRef = useRef<(id: string) => Promise<boolean>>(async () => true);
  const [cloudFlight] = useState(() =>
    createSingleFlight<true, boolean>({
      run: (id) => pushRef.current(id),
      merge: () => true,
      failed: false,
    }),
  );

  useEffect(
    () => () => {
      if (cloudTimerRef.current) clearTimeout(cloudTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    const flush = () => flushCloudRef.current();
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  async function push(id: string) {
    if (!(user?.id && hasCloudSync)) return true;
    const outcome = await pushStored(user.id, id);
    if (outcome !== "failed") {
      if (outcome === "pushed") setLibraryBooks(loadBookLibrary(user.id));
      cloudErrorShownRef.current = false;
      cloudFailuresRef.current = 0;
      return true;
    }
    cloudFailuresRef.current += 1;
    if (!cloudErrorShownRef.current) {
      cloudErrorShownRef.current = true;
      setDialogState({
        open: true,
        title: "Cloud sync failed",
        message:
          "Your book is saved on this device but could not reach the cloud. It keeps retrying in the background.",
        variant: "alert",
        onConfirm: () => setDialogState((prev) => ({ ...prev, open: false })),
      });
    }
    return false;
  }

  function scheduleCloudPush(id: string) {
    if (!(user?.id && hasCloudSync)) return;
    cloudPendingIdRef.current = id;
    if (!cloudTimerRef.current) cloudPendingSinceRef.current = Date.now();
    else clearTimeout(cloudTimerRef.current);
    setCloudPending(true);
    const waited = Date.now() - cloudPendingSinceRef.current;
    const delay =
      cloudFailuresRef.current > 0
        ? Math.min(120000, 15000 * 2 ** (cloudFailuresRef.current - 1))
        : Math.max(0, Math.min(CLOUD_IDLE_MS, CLOUD_MAX_WAIT_MS - waited));
    cloudTimerRef.current = setTimeout(async () => {
      cloudTimerRef.current = null;
      const ok = await cloudFlight.request(id, true);
      if (ok) {
        cloudPendingIdRef.current = null;
        setCloudPending(false);
      } else scheduleCloudPush(id);
    }, delay);
  }

  async function pushNow(id: string) {
    if (!(user?.id && hasCloudSync)) return true;
    if (cloudTimerRef.current) {
      clearTimeout(cloudTimerRef.current);
      cloudTimerRef.current = null;
    }
    setCloudPending(true);
    const ok = await cloudFlight.request(id, true);
    if (ok) {
      cloudPendingIdRef.current = null;
      setCloudPending(false);
    } else scheduleCloudPush(id);
    return ok;
  }

  function flushCloud() {
    const id = cloudPendingIdRef.current;
    if (!id || !cloudTimerRef.current) return;
    void pushNow(id);
  }

  useLayoutEffect(() => {
    pushRef.current = push;
    flushCloudRef.current = flushCloud;
  });

  return { cloudPending, scheduleCloudPush, pushNow };
}
