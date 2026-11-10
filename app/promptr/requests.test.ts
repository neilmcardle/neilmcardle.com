import { describe, expect, it } from "vitest";
import {
  describeRefine,
  describeScore,
  idleRefine,
  idleScore,
  refineRequest,
  scoreRequest,
  type RefineEvent,
  type ScoreEvent,
} from "./requests";
import type { RubricDimension } from "./rubric";

const dim = (key: string, score: number) =>
  ({
    key,
    label: key,
    score,
    explanation: "",
    improvement: "",
  }) as RubricDimension;

const score = (events: ScoreEvent[]) => events.reduce(scoreRequest, idleScore);
const refine = (events: RefineEvent[]) =>
  events.reduce(refineRequest, idleRefine);

describe("promptr score request", () => {
  it("streams dimensions and finishes", () => {
    const state = score([
      { type: "start", run: 1 },
      { type: "dimension", run: 1, dimension: dim("clarity", 4) },
      { type: "finish", run: 1 },
    ]);
    expect(describeScore(state)).toMatchObject({
      isScoring: false,
      scoreError: null,
    });
    expect(describeScore(state).dimensions.size).toBe(1);
  });

  it("drops the old prompt's scores after a new prompt is loaded", () => {
    const state = score([
      { type: "start", run: 1 },
      { type: "clear" },
      { type: "dimension", run: 1, dimension: dim("clarity", 2) },
      { type: "finish", run: 1 },
    ]);
    expect(state).toEqual(idleScore);
  });

  it("ignores a stale run once a newer one has started", () => {
    const state = score([
      { type: "start", run: 1 },
      { type: "start", run: 2 },
      { type: "dimension", run: 1, dimension: dim("clarity", 1) },
      { type: "fail", run: 1, error: "old" },
    ]);
    expect(describeScore(state)).toMatchObject({
      isScoring: true,
      scoreError: null,
    });
    expect(describeScore(state).dimensions.size).toBe(0);
  });
});

describe("promptr refine request", () => {
  it("ignores a refine result that lands after the prompt changed", () => {
    const state = refine([
      { type: "start", run: 1 },
      { type: "clear" },
      { type: "ready", run: 1, result: { refined: "x", changes: [] } },
    ]);
    expect(describeRefine(state).refineResult).toBeNull();
  });

  it("shows the error for the current run", () => {
    const state = refine([
      { type: "start", run: 3 },
      { type: "fail", run: 3, error: "Refine failed" },
    ]);
    expect(describeRefine(state)).toEqual({
      refineResult: null,
      refineError: "Refine failed",
      isRefining: false,
    });
  });
});
