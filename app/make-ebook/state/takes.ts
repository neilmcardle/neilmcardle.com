export type Takes =
  | { status: "idle"; takes: (string | null)[] }
  | {
      status: "running";
      run: number;
      takes: (string | null)[];
      firstError: string | null;
    }
  | { status: "done"; takes: (string | null)[]; error: string | null };

export type TakesEvent =
  | { type: "reset"; count: number }
  | { type: "start"; run: number; count: number }
  | { type: "take"; run: number; index: number; text: string }
  | { type: "failed"; run: number; error: string }
  | { type: "finish"; run: number };

export function emptyTakes(count: number): Takes {
  return { status: "idle", takes: Array(count).fill(null) };
}

export function takesReducer(state: Takes, event: TakesEvent): Takes {
  switch (event.type) {
    case "reset":
      return emptyTakes(event.count);
    case "start":
      return {
        status: "running",
        run: event.run,
        takes: Array(event.count).fill(null),
        firstError: null,
      };
    case "take": {
      if (state.status !== "running" || state.run !== event.run) return state;
      const takes = [...state.takes];
      takes[event.index] = event.text;
      return { ...state, takes };
    }
    case "failed":
      if (state.status !== "running" || state.run !== event.run) return state;
      return { ...state, firstError: state.firstError ?? event.error };
    case "finish":
      if (state.status !== "running" || state.run !== event.run) return state;
      return {
        status: "done",
        takes: state.takes,
        error: state.takes.some(Boolean) ? null : state.firstError,
      };
  }
}

export function describeTakes(state: Takes) {
  return {
    results: state.takes,
    isLoading: state.status === "running",
    error: state.status === "done" ? state.error : null,
  };
}
