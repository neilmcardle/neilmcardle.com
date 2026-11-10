export type Flights<T> = Readonly<Record<string, { queued: T | null }>>;

export type FlightEvent<T> =
  | { type: "request"; key: string; payload: T }
  | { type: "finish"; key: string };

export function flights<T>(
  state: Flights<T>,
  event: FlightEvent<T>,
  merge: (a: T, b: T) => T,
): { state: Flights<T>; run: T | null } {
  const current = state[event.key];
  if (event.type === "request") {
    if (!current) {
      return {
        state: { ...state, [event.key]: { queued: null } },
        run: event.payload,
      };
    }
    const queued =
      current.queued === null
        ? event.payload
        : merge(current.queued, event.payload);
    return { state: { ...state, [event.key]: { queued } }, run: null };
  }
  if (!current) return { state, run: null };
  if (current.queued !== null) {
    return {
      state: { ...state, [event.key]: { queued: null } },
      run: current.queued,
    };
  }
  const rest = { ...state };
  delete rest[event.key];
  return { state: rest, run: null };
}

interface SingleFlightOptions<T, R> {
  run: (key: string, payload: T) => Promise<R>;
  merge: (a: T, b: T) => T;
  failed: R;
  defer?: (fn: () => void) => void;
}

export function createSingleFlight<T, R>({
  run,
  merge,
  failed,
  defer = (fn) => setTimeout(fn, 0),
}: SingleFlightOptions<T, R>) {
  let state: Flights<T> = {};
  const waiters = new Map<string, Array<(result: R) => void>>();

  async function fly(key: string, payload: T): Promise<R> {
    let result = failed;
    try {
      result = await run(key, payload);
    } catch (err) {
      console.error(err);
    }
    const step = flights(state, { type: "finish", key }, merge);
    state = step.state;
    if (step.run !== null) {
      const next = step.run;
      const waiting = waiters.get(key) ?? [];
      waiters.delete(key);
      defer(() => {
        void fly(key, next).then((r) =>
          waiting.forEach((resolve) => resolve(r)),
        );
      });
    }
    return result;
  }

  return {
    request(key: string, payload: T): Promise<R> {
      const step = flights(state, { type: "request", key, payload }, merge);
      state = step.state;
      if (step.run !== null) return fly(key, step.run);
      return new Promise<R>((resolve) => {
        waiters.set(key, [...(waiters.get(key) ?? []), resolve]);
      });
    },
    isBusy(key: string) {
      return key in state;
    },
  };
}
