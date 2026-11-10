export type SnipRect = { x: number; y: number; w: number; h: number };
type Pt = { x: number; y: number };

export const MIN_SNIP = 6;

export type Snip =
  | { phase: "none" }
  | { phase: "drawing"; start: Pt; rect: SnipRect }
  | { phase: "selected"; rect: SnipRect }
  | { phase: "saving"; rect: SnipRect; run: number };

export type SnipEvent =
  | { type: "begin"; at: Pt }
  | { type: "drag"; at: Pt }
  | { type: "end" }
  | { type: "save"; run: number }
  | { type: "saved"; run: number; keep?: boolean }
  | { type: "cancel" };

export const noSnip: Snip = { phase: "none" };

export function snip(state: Snip, event: SnipEvent): Snip {
  switch (event.type) {
    case "begin":
      if (state.phase === "saving") return state;
      return {
        phase: "drawing",
        start: event.at,
        rect: { x: event.at.x, y: event.at.y, w: 0, h: 0 },
      };
    case "drag": {
      if (state.phase !== "drawing") return state;
      const { start } = state;
      return {
        ...state,
        rect: {
          x: Math.min(start.x, event.at.x),
          y: Math.min(start.y, event.at.y),
          w: Math.abs(event.at.x - start.x),
          h: Math.abs(event.at.y - start.y),
        },
      };
    }
    case "end":
      if (state.phase !== "drawing") return state;
      return state.rect.w < MIN_SNIP || state.rect.h < MIN_SNIP
        ? noSnip
        : { phase: "selected", rect: state.rect };
    case "save":
      return state.phase === "selected"
        ? { phase: "saving", rect: state.rect, run: event.run }
        : state;
    case "saved":
      if (state.phase !== "saving" || state.run !== event.run) return state;
      return event.keep ? { phase: "selected", rect: state.rect } : noSnip;
    case "cancel":
      return noSnip;
  }
}

export function snipOwnsSave(state: Snip, run: number) {
  return state.phase === "saving" && state.run === run;
}

export function snipRect(state: Snip): SnipRect | null {
  return state.phase === "none" ? null : state.rect;
}

export type ExportStatus =
  | { status: "idle" }
  | { status: "downloading" }
  | { status: "done"; result: "shared" | "downloaded" }
  | { status: "error"; error: string };

export type ExportEvent =
  | { type: "start" }
  | { type: "done"; result: "shared" | "downloaded" }
  | { type: "cancelled" }
  | { type: "fail"; error: string }
  | { type: "settle" };

export const EXPORT_DONE_MS = 1800;

export function exportStatus(
  state: ExportStatus,
  event: ExportEvent,
): ExportStatus {
  switch (event.type) {
    case "start":
      return state.status === "downloading" ? state : { status: "downloading" };
    case "done":
      return state.status === "downloading"
        ? { status: "done", result: event.result }
        : state;
    case "cancelled":
      return state.status === "downloading" ? { status: "idle" } : state;
    case "fail":
      return state.status === "downloading"
        ? { status: "error", error: event.error }
        : state;
    case "settle":
      return state.status === "done" ? { status: "idle" } : state;
  }
}
