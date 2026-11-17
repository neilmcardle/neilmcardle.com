import { useState } from "react";
import { usePresence, type PresenceState } from "./usePresence";

export function useExit<T>(
  open: boolean,
  value: T,
  exitMs: number,
): { mounted: boolean; state: PresenceState; value: T } {
  const { mounted, state } = usePresence(open, exitMs);
  const [held, setHeld] = useState(value);
  if (open && held !== value) setHeld(value);
  return { mounted, state, value: open ? value : held };
}
