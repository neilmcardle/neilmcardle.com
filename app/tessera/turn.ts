export type Player = "p1" | "p2";

export type Turn =
  | { phase: "awaitRoll"; player: Player }
  | { phase: "rolling"; player: Player; face: number }
  | {
      phase: "drawing";
      player: Player;
      die: number;
      left: number;
      note: string;
    }
  | { phase: "handoff"; player: Player; die: number }
  | { phase: "over"; player: Player; die: number };

export type TurnEvent =
  | { type: "roll"; face: number }
  | { type: "tick"; face: number }
  | { type: "rolled"; value: number }
  | { type: "draw"; gained: number; full: boolean }
  | { type: "handOff" }
  | { type: "reset" };

export const ROLL_TICK_MS = 70;
export const ROLL_TICKS = 9;
export const HANDOFF_MS = 350;

export const initialTurn: Turn = { phase: "awaitRoll", player: "p1" };

export const allowedMoves: Record<Turn["phase"], TurnEvent["type"][]> = {
  awaitRoll: ["roll", "reset"],
  rolling: ["tick", "rolled", "reset"],
  drawing: ["draw", "reset"],
  handoff: ["handOff", "reset"],
  over: ["reset"],
};

const other = (p: Player): Player => (p === "p1" ? "p2" : "p1");

export function turn(state: Turn, event: TurnEvent): Turn {
  if (!allowedMoves[state.phase].includes(event.type)) return state;
  switch (event.type) {
    case "reset":
      return initialTurn;
    case "roll":
      return { phase: "rolling", player: state.player, face: event.face };
    case "tick":
      return state.phase === "rolling" ? { ...state, face: event.face } : state;
    case "rolled":
      return {
        phase: "drawing",
        player: state.player,
        die: event.value,
        left: event.value,
        note: "",
      };
    case "draw": {
      if (state.phase !== "drawing") return state;
      if (event.full)
        return { phase: "over", player: state.player, die: state.die };
      const left = state.left - 1;
      if (left <= 0)
        return { phase: "handoff", player: state.player, die: state.die };
      const note = `${event.gained ? `Captured ${event.gained}! ` : ""}${left} line${left > 1 ? "s" : ""} left.`;
      return { ...state, left, note };
    }
    case "handOff":
      return { phase: "awaitRoll", player: other(state.player) };
  }
}

export function dieFace(state: Turn): number | null {
  switch (state.phase) {
    case "awaitRoll":
      return null;
    case "rolling":
      return state.face;
    default:
      return state.die;
  }
}

export function linesLeft(state: Turn): number {
  return state.phase === "drawing" ? state.left : 0;
}
