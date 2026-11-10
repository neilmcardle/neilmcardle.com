import { describe, expect, it } from "vitest";
import {
  celebration,
  showsCelebration,
  type Celebration,
  type CelebrationEvent,
} from "./celebration";

function run(
  events: CelebrationEvent[],
  from: Celebration = { phase: "working", topic: "a" },
) {
  return events.reduce<Celebration>(celebration, from);
}

describe("topic celebration", () => {
  it("celebrates once per finish", () => {
    const state = run([
      { type: "progress", percentage: 100 },
      { type: "dismiss" },
      { type: "progress", percentage: 100 },
    ]);
    expect(state.phase).toBe("celebrated");
  });

  it("celebrates again after the lesson is restarted and finished", () => {
    const state = run([
      { type: "finish" },
      { type: "dismiss" },
      { type: "progress", percentage: 0 },
      { type: "finish" },
    ]);
    expect(state.phase).toBe("celebrating");
  });

  it("stops showing the last topic’s celebration when the topic changes", () => {
    const state = run([{ type: "finish" }, { type: "topic", topic: "b" }]);
    expect(showsCelebration(state, "b")).toBe(false);
    expect(state.phase).toBe("working");
  });
});
