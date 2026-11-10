import { describe, expect, it } from "vitest";
import { freshDrill, pressKey, type Drill } from "./drill";

const type = (keys: string, items: string[], from: Drill = freshDrill) => {
  let drill = from;
  let at = 1000;
  const outcomes: string[] = [];
  for (const k of keys) {
    const r = pressKey(drill, k, (at += 200), items);
    drill = r.drill;
    outcomes.push(r.outcome);
  }
  return { drill, outcomes };
};

describe("touchtype drill", () => {
  it("counts two fast keys against the latest state, not a stale one", () => {
    const { drill } = type("as", ["asdf"]);
    expect(drill.charIdx).toBe(2);
    expect(drill.keystrokes).toBe(2);
  });

  it("counts errors without moving on", () => {
    const { drill, outcomes } = type("xa", ["ab"]);
    expect(outcomes).toEqual(["wrong", "right"]);
    expect(drill).toMatchObject({ charIdx: 1, errors: 1, keystrokes: 2 });
  });

  it("moves to the next item and finishes with a result", () => {
    const { drill, outcomes } = type("abcd", ["ab", "cd"]);
    expect(outcomes).toEqual(["right", "nextItem", "right", "finished"]);
    expect(drill.result).toMatchObject({ chars: 4, errors: 0, acc: 100 });
    expect(pressKey(drill, "a", 9999, ["ab", "cd"]).outcome).toBe("ignored");
  });

  it("keeps the start time from the first key", () => {
    const first = pressKey(freshDrill, "a", 500, ["abc"]).drill;
    const second = pressKey(first, "b", 900, ["abc"]).drill;
    expect(second.drillStart).toBe(500);
  });
});
