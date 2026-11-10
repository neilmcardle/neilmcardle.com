export type Remote<T> =
  | { status: "idle" }
  | { status: "loading"; key: string; attempt: number }
  | { status: "ready"; key: string; data: T }
  | { status: "error"; key: string; attempt: number };

export type RemoteEvent<T> =
  | { type: "load"; key: string }
  | { type: "retry" }
  | { type: "ready"; key: string; data: T }
  | { type: "fail"; key: string }
  | { type: "clear" };

export const idleRemote = { status: "idle" } as const;

export function remote<T>(state: Remote<T>, event: RemoteEvent<T>): Remote<T> {
  switch (event.type) {
    case "load":
      if (state.status !== "idle" && state.key === event.key) return state;
      return { status: "loading", key: event.key, attempt: 0 };
    case "retry":
      if (state.status === "error")
        return {
          status: "loading",
          key: state.key,
          attempt: state.attempt + 1,
        };
      if (state.status === "ready")
        return { status: "loading", key: state.key, attempt: 1 };
      return state;
    case "ready":
      return state.status === "loading" && state.key === event.key
        ? { status: "ready", key: event.key, data: event.data }
        : state;
    case "fail":
      return state.status === "loading" && state.key === event.key
        ? { status: "error", key: event.key, attempt: state.attempt }
        : state;
    case "clear":
      return idleRemote;
  }
}

export function remoteData<T>(state: Remote<T>, key: string | null): T | null {
  return state.status === "ready" && state.key === key ? state.data : null;
}

export function remoteFailed<T>(state: Remote<T>, key: string | null) {
  return state.status === "error" && state.key === key;
}

export type Paging =
  | { status: "idle"; page: number }
  | { status: "loading"; page: number }
  | { status: "error"; page: number }
  | { status: "done"; page: number };

export type PagingEvent =
  | { type: "load" }
  | { type: "loaded"; added: number; more: boolean }
  | { type: "fail" }
  | { type: "retry" };

export const initialPaging: Paging = { status: "idle", page: 0 };

export function paging(state: Paging, event: PagingEvent): Paging {
  switch (event.type) {
    case "load":
      return state.status === "idle"
        ? { status: "loading", page: state.page }
        : state;
    case "retry":
      return state.status === "error"
        ? { status: "loading", page: state.page }
        : state;
    case "loaded":
      if (state.status !== "loading") return state;
      return {
        status: event.more && event.added > 0 ? "idle" : "done",
        page: state.page + 1,
      };
    case "fail":
      return state.status === "loading"
        ? { status: "error", page: state.page }
        : state;
  }
}
