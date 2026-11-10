import type { BookMindActivity } from "../hooks/useBookMind";

export type BookMindErrorCode = "free_question_spent";

export class BookMindError extends Error {
  code?: BookMindErrorCode;

  constructor(message: string, code?: BookMindErrorCode) {
    super(message);
    this.name = "BookMindError";
    this.code = code;
  }
}

export type BookMindRequest =
  | { status: "idle"; error: string | null; code?: BookMindErrorCode }
  | { status: "reading"; activity: BookMindActivity | null }
  | { status: "streaming" };

export type BookMindRequestEvent =
  | { type: "send" }
  | { type: "read"; activity: BookMindActivity }
  | { type: "stream" }
  | { type: "done" }
  | { type: "stopped" }
  | { type: "failed"; error: string; code?: BookMindErrorCode }
  | { type: "sideFailed"; error: string }
  | { type: "clearError" };

export const initialBookMindRequest: BookMindRequest = {
  status: "idle",
  error: null,
};

export function bookMindRequest(
  state: BookMindRequest,
  event: BookMindRequestEvent,
): BookMindRequest {
  switch (event.type) {
    case "send":
      return { status: "reading", activity: null };
    case "read":
      return state.status === "reading"
        ? { status: "reading", activity: event.activity }
        : state;
    case "stream":
      return state.status === "reading" ? { status: "streaming" } : state;
    case "done":
    case "stopped":
      return { status: "idle", error: null };
    case "failed":
      return { status: "idle", error: event.error, code: event.code };
    case "sideFailed":
      return state.status === "idle"
        ? { status: "idle", error: event.error }
        : state;
    case "clearError":
      return state.status === "idle" ? { status: "idle", error: null } : state;
  }
}

export function describeBookMindRequest(state: BookMindRequest) {
  return {
    isLoading: state.status === "reading",
    isStreaming: state.status === "streaming",
    activity: state.status === "reading" ? state.activity : null,
    error: state.status === "idle" ? state.error : null,
    errorCode: state.status === "idle" ? state.code : undefined,
  };
}
