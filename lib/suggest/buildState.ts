export const SUGGESTION_STATUSES = [
  "new",
  "building",
  "ready",
  "live",
  "rejected",
  "failed",
] as const;

export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export type SuggestionEvent =
  | "build"
  | "dispatch_failed"
  | "stop"
  | "timeout"
  | "report_ready"
  | "report_failed"
  | "reject"
  | "go_live";

export const STALE_BUILD_MINUTES = 30;

export const SUGGESTION_TRANSITIONS: Record<
  SuggestionEvent,
  { from: readonly SuggestionStatus[]; to: SuggestionStatus }
> = {
  build: { from: ["new", "failed"], to: "building" },
  dispatch_failed: { from: ["building"], to: "failed" },
  stop: { from: ["building"], to: "failed" },
  timeout: { from: ["building"], to: "failed" },
  report_ready: { from: ["building"], to: "ready" },
  report_failed: { from: ["building"], to: "failed" },
  reject: { from: ["new", "failed", "ready"], to: "rejected" },
  go_live: { from: ["ready"], to: "live" },
};

export function canTransition(
  from: SuggestionStatus,
  event: SuggestionEvent,
): boolean {
  return SUGGESTION_TRANSITIONS[event].from.includes(from);
}

export function runToken(startedAt: Date | null | undefined): string {
  return startedAt ? String(startedAt.getTime()) : "";
}

export function reportEvent(prUrl: string | null): SuggestionEvent {
  return prUrl ? "report_ready" : "report_failed";
}
