export type Celebration =
  | { phase: "working"; topic: string }
  | { phase: "celebrating"; topic: string }
  | { phase: "celebrated"; topic: string };

export type CelebrationEvent =
  | { type: "topic"; topic: string }
  | { type: "progress"; percentage: number }
  | { type: "finish" }
  | { type: "dismiss" };

export function celebration(
  state: Celebration,
  event: CelebrationEvent,
): Celebration {
  switch (event.type) {
    case "topic":
      return event.topic === state.topic
        ? state
        : { phase: "working", topic: event.topic };
    case "progress":
      if (event.percentage >= 100)
        return celebration(state, { type: "finish" });
      return state.phase === "celebrated"
        ? { phase: "working", topic: state.topic }
        : state;
    case "finish":
      return state.phase === "working"
        ? { phase: "celebrating", topic: state.topic }
        : state;
    case "dismiss":
      return state.phase === "celebrating"
        ? { phase: "celebrated", topic: state.topic }
        : state;
  }
}

export function showsCelebration(state: Celebration, topic: string) {
  return state.phase === "celebrating" && state.topic === topic;
}
