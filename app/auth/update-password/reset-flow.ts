export type ResetFlow =
  | { phase: "checking" }
  | { phase: "invalid"; reason: string }
  | { phase: "ready"; error: string | null }
  | { phase: "saving" }
  | { phase: "done" };

export type ResetFlowEvent =
  | { type: "linkOk" }
  | { type: "linkBad"; reason: string }
  | { type: "reject"; error: string }
  | { type: "submit" }
  | { type: "saved" }
  | { type: "failed"; error: string };

export const REDIRECT_MS = 2000;

export const initialResetFlow: ResetFlow = { phase: "checking" };

export function resetFlow(state: ResetFlow, event: ResetFlowEvent): ResetFlow {
  switch (event.type) {
    case "linkOk":
      return state.phase === "checking"
        ? { phase: "ready", error: null }
        : state;
    case "linkBad":
      return state.phase === "checking"
        ? { phase: "invalid", reason: event.reason }
        : state;
    case "reject":
      return state.phase === "ready"
        ? { phase: "ready", error: event.error }
        : state;
    case "submit":
      return state.phase === "ready" ? { phase: "saving" } : state;
    case "saved":
      return state.phase === "saving" ? { phase: "done" } : state;
    case "failed":
      return state.phase === "saving"
        ? { phase: "ready", error: event.error }
        : state;
  }
}
