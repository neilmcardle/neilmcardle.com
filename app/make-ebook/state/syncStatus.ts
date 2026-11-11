export interface SyncGate {
  running: boolean;
  rerun: boolean;
  lastAt: number;
  conflictsOpen: boolean;
}

export const initialSyncGate: SyncGate = {
  running: false,
  rerun: false,
  lastAt: 0,
  conflictsOpen: false,
};

export function requestSync(
  gate: SyncGate,
  request: {
    force: boolean;
    now: number;
    throttleMs: number;
    hasUser: boolean;
  },
): { gate: SyncGate; run: boolean } {
  if (gate.running || gate.conflictsOpen) {
    return {
      gate: request.force && gate.running ? { ...gate, rerun: true } : gate,
      run: false,
    };
  }
  if (!request.force && request.now - gate.lastAt < request.throttleMs)
    return { gate, run: false };
  if (!request.hasUser) return { gate, run: false };
  return { gate: { ...gate, running: true, lastAt: request.now }, run: true };
}

export function finishSync(gate: SyncGate): {
  gate: SyncGate;
  rerun: boolean;
} {
  return { gate: { ...gate, running: false, rerun: false }, rerun: gate.rerun };
}

export interface SyncStatus<C, B> {
  initialDone: boolean;
  conflicts: C[];
  merged: Map<string, B> | null;
}

export type SyncStatusEvent<C, B> =
  | { type: "finished" }
  | { type: "timedOut" }
  | { type: "conflicts"; conflicts: C[]; merged: Map<string, B> }
  | { type: "resolved"; remaining: C[]; merged: Map<string, B> | null }
  | { type: "setConflicts"; conflicts: C[] }
  | { type: "setMerged"; merged: Map<string, B> | null };

export function initialSyncStatus<C, B>(): SyncStatus<C, B> {
  return { initialDone: false, conflicts: [], merged: null };
}

export function syncStatus<C, B>(
  state: SyncStatus<C, B>,
  event: SyncStatusEvent<C, B>,
): SyncStatus<C, B> {
  switch (event.type) {
    case "finished":
    case "timedOut":
      return state.initialDone ? state : { ...state, initialDone: true };
    case "conflicts":
      return { ...state, conflicts: event.conflicts, merged: event.merged };
    case "resolved":
      return event.remaining.length > 0
        ? { ...state, conflicts: event.remaining, merged: event.merged }
        : { ...state, conflicts: [], merged: null };
    case "setConflicts":
      return { ...state, conflicts: event.conflicts };
    case "setMerged":
      return { ...state, merged: event.merged };
  }
}
