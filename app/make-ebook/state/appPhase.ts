export type AppPhase =
  | { kind: "booting"; landing: boolean }
  | { kind: "marketing"; hydrated: boolean }
  | { kind: "choosing" }
  | { kind: "loading"; from: "choosing" | "ready"; pending: number }
  | { kind: "ready" };

export type AppPhaseEvent =
  | { type: "noUser" }
  | { type: "signedIn" }
  | { type: "signedOut" }
  | { type: "hydrated" }
  | { type: "startWriting" }
  | { type: "loadStarted" }
  | { type: "loadAbandoned" }
  | { type: "opened" }
  | { type: "closed" };

export const initialAppPhase: AppPhase = { kind: "booting", landing: true };

export function isHydrated(phase: AppPhase) {
  switch (phase.kind) {
    case "booting":
      return false;
    case "marketing":
      return phase.hydrated;
    default:
      return true;
  }
}

export function showsLanding(phase: AppPhase) {
  return (
    phase.kind === "marketing" || (phase.kind === "booting" && phase.landing)
  );
}

function intoEditor(phase: AppPhase, open: boolean): AppPhase {
  if (!isHydrated(phase)) return { kind: "booting", landing: false };
  return open ? { kind: "ready" } : { kind: "choosing" };
}

export function appPhase(phase: AppPhase, event: AppPhaseEvent): AppPhase {
  switch (event.type) {
    case "noUser":
      return phase.kind === "booting" && phase.landing
        ? { kind: "marketing", hydrated: false }
        : phase;
    case "signedIn":
    case "startWriting":
      if (phase.kind === "booting") return { kind: "booting", landing: false };
      if (phase.kind === "marketing") return intoEditor(phase, false);
      return phase;
    case "signedOut":
      return { kind: "marketing", hydrated: isHydrated(phase) };
    case "hydrated":
      if (phase.kind === "booting")
        return phase.landing
          ? { kind: "marketing", hydrated: true }
          : { kind: "choosing" };
      if (phase.kind === "marketing")
        return { kind: "marketing", hydrated: true };
      return phase;
    case "loadStarted":
      if (phase.kind === "loading")
        return { ...phase, pending: phase.pending + 1 };
      if (phase.kind === "choosing" || phase.kind === "ready")
        return { kind: "loading", from: phase.kind, pending: 1 };
      return phase;
    case "loadAbandoned":
      if (phase.kind !== "loading") return phase;
      return phase.pending > 1
        ? { ...phase, pending: phase.pending - 1 }
        : { kind: phase.from };
    case "opened":
      if (phase.kind === "booting") return { kind: "booting", landing: false };
      if (phase.kind === "marketing") return intoEditor(phase, true);
      return { kind: "ready" };
    case "closed":
      return phase.kind === "ready" || phase.kind === "loading"
        ? { kind: "choosing" }
        : phase;
  }
}
