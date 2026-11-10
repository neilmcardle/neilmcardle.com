import type {
  DimensionKey,
  RefineResponse,
  RubricDimension,
  RubricSummary,
} from "./rubric";

export type ScoreRequest =
  | { status: "idle" }
  | {
      status: "streaming" | "done";
      run: number;
      dimensions: Map<DimensionKey, RubricDimension>;
      summary: RubricSummary | null;
    }
  | {
      status: "failed";
      run: number;
      dimensions: Map<DimensionKey, RubricDimension>;
      summary: RubricSummary | null;
      error: string;
    };

export type ScoreEvent =
  | { type: "start"; run: number }
  | { type: "dimension"; run: number; dimension: RubricDimension }
  | { type: "summary"; run: number; summary: RubricSummary }
  | { type: "finish"; run: number }
  | { type: "fail"; run: number; error: string }
  | { type: "clear" };

export const idleScore: ScoreRequest = { status: "idle" };

export function scoreRequest(
  state: ScoreRequest,
  event: ScoreEvent,
): ScoreRequest {
  if (event.type === "clear") return idleScore;
  if (event.type === "start")
    return {
      status: "streaming",
      run: event.run,
      dimensions: new Map(),
      summary: null,
    };
  if (state.status !== "streaming" || state.run !== event.run) return state;
  switch (event.type) {
    case "dimension": {
      const dimensions = new Map(state.dimensions);
      dimensions.set(event.dimension.key, event.dimension);
      return { ...state, dimensions };
    }
    case "summary":
      return { ...state, summary: event.summary };
    case "finish":
      return { ...state, status: "done" };
    case "fail":
      return { ...state, status: "failed", error: event.error };
  }
}

export function describeScore(state: ScoreRequest) {
  return {
    dimensions:
      state.status === "idle"
        ? new Map<DimensionKey, RubricDimension>()
        : state.dimensions,
    summary: state.status === "idle" ? null : state.summary,
    isScoring: state.status === "streaming",
    scoreError: state.status === "failed" ? state.error : null,
  };
}

export type RefineRequest =
  | { status: "idle" }
  | { status: "running"; run: number }
  | { status: "ready"; run: number; result: RefineResponse }
  | { status: "failed"; run: number; error: string };

export type RefineEvent =
  | { type: "start"; run: number }
  | { type: "ready"; run: number; result: RefineResponse }
  | { type: "fail"; run: number; error: string }
  | { type: "clear" };

export const idleRefine: RefineRequest = { status: "idle" };

export function refineRequest(
  state: RefineRequest,
  event: RefineEvent,
): RefineRequest {
  if (event.type === "clear") return idleRefine;
  if (event.type === "start") return { status: "running", run: event.run };
  if (state.status !== "running" || state.run !== event.run) return state;
  if (event.type === "ready")
    return { status: "ready", run: event.run, result: event.result };
  return { status: "failed", run: event.run, error: event.error };
}

export function describeRefine(state: RefineRequest) {
  return {
    refineResult: state.status === "ready" ? state.result : null,
    refineError: state.status === "failed" ? state.error : null,
    isRefining: state.status === "running",
  };
}
