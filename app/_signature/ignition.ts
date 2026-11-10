export type Ignition =
  | { phase: "closed" }
  | { phase: "open" }
  | { phase: "loading" }
  | { phase: "running" }
  | { phase: "revealed"; open: boolean; closeSoon: boolean };

export type IgnitionEvent =
  | { type: "open" }
  | { type: "close" }
  | { type: "ignite" }
  | { type: "loaded"; ok: boolean }
  | { type: "finished" };

export const CLOSE_AFTER_RUN_MS = 1600;

export const initialIgnition: Ignition = { phase: "closed" };

export function ignition(state: Ignition, event: IgnitionEvent): Ignition {
  switch (event.type) {
    case "open":
      if (state.phase === "closed") return { phase: "open" };
      if (state.phase === "revealed")
        return { phase: "revealed", open: true, closeSoon: false };
      return state;
    case "close":
      if (state.phase === "open") return { phase: "closed" };
      if (state.phase === "revealed")
        return { phase: "revealed", open: false, closeSoon: false };
      return state;
    case "ignite":
      return state.phase === "loading" || state.phase === "running"
        ? state
        : { phase: "loading" };
    case "loaded":
      if (state.phase !== "loading") return state;
      return event.ok
        ? { phase: "running" }
        : { phase: "revealed", open: true, closeSoon: false };
    case "finished":
      return state.phase === "running"
        ? { phase: "revealed", open: true, closeSoon: true }
        : state;
  }
}

export function describeIgnition(state: Ignition) {
  const revealed =
    state.phase === "loading" ||
    state.phase === "running" ||
    state.phase === "revealed";
  return {
    open: state.phase === "revealed" ? state.open : state.phase !== "closed",
    running: state.phase === "loading" || state.phase === "running",
    revealed,
    said: state.phase === "revealed",
  };
}

export function retryable<T>(load: () => Promise<T>) {
  let pending: Promise<T> | undefined;
  return () => {
    pending ??= load().catch((error: unknown) => {
      pending = undefined;
      throw error;
    });
    return pending;
  };
}
