import { describe, expect, it } from "vitest";
import {
  initialTurn,
  linesLeft,
  turn,
  type Turn,
  type TurnEvent,
} from "./turn";

function run(events: TurnEvent[], from: Turn = initialTurn) {
  return events.reduce<Turn>(turn, from);
}

describe("tessera turn", () => {
  it("rolls, draws the die's lines and hands off to the other player", () => {
    const drawing = run([
      { type: "roll", face: 3 },
      { type: "tick", face: 5 },
      { type: "rolled", value: 2 },
    ]);
    expect(drawing).toMatchObject({ phase: "drawing", left: 2, die: 2 });
    const after = run(
      [
        { type: "draw", gained: 1, full: false },
        { type: "draw", gained: 0, full: false },
        { type: "handOff" },
      ],
      drawing,
    );
    expect(after).toEqual({ phase: "awaitRoll", player: "p2" });
  });

  it("refuses a roll during the hand-off, so no extra turn", () => {
    const handoff = run([
      { type: "roll", face: 1 },
      { type: "rolled", value: 1 },
      { type: "draw", gained: 0, full: false },
    ]);
    expect(handoff.phase).toBe("handoff");
    expect(run([{ type: "roll", face: 4 }], handoff)).toBe(handoff);
    expect(linesLeft(handoff)).toBe(0);
  });

  it("ignores a late roll result after a reset", () => {
    const state = run([
      { type: "roll", face: 2 },
      { type: "reset" },
      { type: "rolled", value: 6 },
    ]);
    expect(state).toEqual(initialTurn);
  });

  it("ignores a late hand-off after a reset", () => {
    const state = run([
      { type: "roll", face: 2 },
      { type: "rolled", value: 1 },
      { type: "draw", gained: 0, full: false },
      { type: "reset" },
      { type: "handOff" },
    ]);
    expect(state).toEqual(initialTurn);
  });

  it("ends the game when the board fills", () => {
    const state = run([
      { type: "roll", face: 2 },
      { type: "rolled", value: 4 },
      { type: "draw", gained: 2, full: true },
      { type: "roll", face: 3 },
    ]);
    expect(state.phase).toBe("over");
  });

  it("keeps the capture note while lines are left", () => {
    const state = run([
      { type: "roll", face: 2 },
      { type: "rolled", value: 3 },
      { type: "draw", gained: 1, full: false },
    ]);
    expect(state).toMatchObject({ note: "Captured 1! 2 lines left." });
  });
});
