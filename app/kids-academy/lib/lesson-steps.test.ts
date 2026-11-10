import { describe, expect, it } from "vitest";
import {
  canAutoAdvance,
  initialLessonSteps,
  lessonProgress,
  lessonSteps,
  type LessonSteps,
  type LessonStepsEvent,
} from "./lesson-steps";

function run(
  events: LessonStepsEvent[],
  from: LessonSteps = initialLessonSteps(3),
) {
  return events.reduce<LessonSteps>(lessonSteps, from);
}

describe("lesson steps", () => {
  it("completes a step, unlocks the next and celebrates once", () => {
    const state = run([
      { type: "complete", step: 0 },
      { type: "complete", step: 0 },
    ]);
    expect(state.completed).toEqual([0]);
    expect(state.unlockedUpTo).toBe(1);
    expect(state.celebrating).toBe(0);
    expect(lessonProgress(state)).toBe(33);
  });

  it("does not replay the celebration when a step is reset", () => {
    const state = run([
      { type: "complete", step: 0 },
      { type: "complete", step: 1 },
      { type: "celebrated", step: 1 },
      { type: "resetStep", step: 1 },
    ]);
    expect(state.celebrating).toBeNull();
    expect(state.completed).toEqual([0]);
  });

  it("refuses a stale auto-advance after the step was reset", () => {
    const before = run([{ type: "complete", step: 0 }]);
    expect(canAutoAdvance(before)).toBe(true);
    const reset = run([{ type: "resetStep", step: 0 }], before);
    expect(run([{ type: "advance", from: 0, auto: true }], reset)).toBe(reset);
  });

  it("auto-advances only once from a step", () => {
    const once = run([
      { type: "complete", step: 0 },
      { type: "advance", from: 0, auto: true },
    ]);
    expect(once.advanced).toEqual([0]);
    expect(canAutoAdvance(once)).toBe(false);
  });

  it("a late celebration end after restart does nothing", () => {
    const state = run([
      { type: "complete", step: 0 },
      { type: "restart" },
      { type: "celebrated", step: 0 },
    ]);
    expect(state).toEqual(initialLessonSteps(3));
  });

  it("clears a running celebration on restart", () => {
    const state = run([{ type: "complete", step: 2 }, { type: "restart" }]);
    expect(state.celebrating).toBeNull();
  });

  it("finishes when advancing past the last step", () => {
    const state = run([{ type: "advance", from: 2 }]);
    expect(state.finished).toBe(true);
    expect(state.unlockedUpTo).toBe(3);
    expect(run([{ type: "advance", from: 3 }], state)).toBe(state);
  });
});
