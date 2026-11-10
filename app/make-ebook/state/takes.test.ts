import { describe, expect, it } from "vitest";
import {
  describeTakes,
  emptyTakes,
  takesReducer,
  type Takes,
  type TakesEvent,
} from "./takes";

function run(events: TakesEvent[], from: Takes = emptyTakes(3)) {
  return events.reduce<Takes>(takesReducer, from);
}

describe("takesReducer", () => {
  it("collects takes and finishes without an error", () => {
    const state = run([
      { type: "start", run: 1, count: 2 },
      { type: "take", run: 1, index: 1, text: "B" },
      { type: "take", run: 1, index: 0, text: "A" },
      { type: "finish", run: 1 },
    ]);
    expect(describeTakes(state)).toEqual({
      results: ["A", "B"],
      isLoading: false,
      error: null,
    });
  });

  it("shows no error when some takes succeed", () => {
    const state = run([
      { type: "start", run: 1, count: 2 },
      { type: "failed", run: 1, error: "Timeout" },
      { type: "take", run: 1, index: 1, text: "B" },
      { type: "finish", run: 1 },
    ]);
    expect(describeTakes(state).error).toBeNull();
  });

  it("shows the first error when every take fails", () => {
    const state = run([
      { type: "start", run: 1, count: 2 },
      { type: "failed", run: 1, error: "First" },
      { type: "failed", run: 1, error: "Second" },
      { type: "finish", run: 1 },
    ]);
    expect(describeTakes(state).error).toBe("First");
  });

  it("drops a late take from an earlier run", () => {
    const state = run([
      { type: "start", run: 1, count: 1 },
      { type: "start", run: 2, count: 1 },
      { type: "take", run: 1, index: 0, text: "Stale" },
      { type: "finish", run: 1 },
    ]);
    expect(state.status).toBe("running");
    expect(describeTakes(state).results).toEqual([null]);
  });

  it("ignores takes after a reset", () => {
    const state = run([
      { type: "start", run: 1, count: 1 },
      { type: "reset", count: 3 },
      { type: "take", run: 1, index: 0, text: "Late" },
    ]);
    expect(state).toEqual(emptyTakes(3));
  });
});
