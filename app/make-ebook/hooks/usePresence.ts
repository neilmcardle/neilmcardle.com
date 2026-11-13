import { useEffect, useState } from "react";

export type PresenceState = "open" | "closed";

export function usePresence(
  open: boolean,
  exitMs: number,
): { mounted: boolean; state: PresenceState } {
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open || !mounted) return;
    const timer = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(timer);
  }, [open, mounted, exitMs]);

  return { mounted: open || mounted, state: open ? "open" : "closed" };
}
