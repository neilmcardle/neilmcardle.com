export type LessonSteps = {
  total: number;
  active: number;
  unlockedUpTo: number;
  completed: number[];
  celebrating: number | null;
  advanced: number[];
  finished: boolean;
};

export type LessonStepsEvent =
  | { type: "view"; step: number }
  | { type: "complete"; step: number }
  | { type: "celebrated"; step: number }
  | { type: "advance"; from: number; auto?: boolean }
  | { type: "resetStep"; step: number }
  | { type: "restart" };

export const CELEBRATE_MS = 4000;
export const AUTO_ADVANCE_MS = 2000;
export const ANSWER_PAUSE_MS = 1100;

export function initialLessonSteps(total: number): LessonSteps {
  return {
    total,
    active: 0,
    unlockedUpTo: 0,
    completed: [],
    celebrating: null,
    advanced: [],
    finished: false,
  };
}

const without = (list: number[], n: number) => list.filter((x) => x !== n);
const withSorted = (list: number[], n: number) =>
  list.includes(n) ? list : [...list, n].sort((a, b) => a - b);

export function canAutoAdvance(
  state: LessonSteps,
): state is LessonSteps & { celebrating: number } {
  return (
    state.celebrating !== null &&
    state.celebrating === state.active &&
    !state.advanced.includes(state.celebrating)
  );
}

export function lessonSteps(
  state: LessonSteps,
  event: LessonStepsEvent,
): LessonSteps {
  switch (event.type) {
    case "view":
      return event.step === state.active
        ? state
        : { ...state, active: event.step };
    case "complete": {
      if (state.completed.includes(event.step)) return state;
      return {
        ...state,
        completed: withSorted(state.completed, event.step),
        unlockedUpTo: Math.max(state.unlockedUpTo, event.step + 1),
        celebrating: event.step,
      };
    }
    case "celebrated":
      return state.celebrating === event.step
        ? { ...state, celebrating: null }
        : state;
    case "advance": {
      if (
        event.auto &&
        !(canAutoAdvance(state) && state.celebrating === event.from)
      )
        return state;
      const next = event.from + 1;
      if (next > state.total) return state;
      return {
        ...state,
        unlockedUpTo: Math.max(state.unlockedUpTo, next),
        advanced: withSorted(state.advanced, event.from),
        finished: state.finished || next === state.total,
      };
    }
    case "resetStep":
      return {
        ...state,
        completed: without(state.completed, event.step),
        advanced: without(state.advanced, event.step),
        celebrating:
          state.celebrating === event.step ? null : state.celebrating,
      };
    case "restart":
      return initialLessonSteps(state.total);
  }
}

export function lessonProgress(state: LessonSteps): number {
  return Math.round((state.completed.length / state.total) * 100);
}
