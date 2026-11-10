import { describe, expect, it } from "vitest";
import {
  bookMindRequest,
  describeBookMindRequest,
  initialBookMindRequest,
  type BookMindRequest,
  type BookMindRequestEvent,
} from "./bookMindRequest";

const activity = { read: ["Chapter 1"], deep: false, startedAt: 1 };

function run(events: BookMindRequestEvent[], from = initialBookMindRequest) {
  return events.reduce<BookMindRequest>(bookMindRequest, from);
}

describe("bookMindRequest", () => {
  it("goes idle, reading, streaming, idle on a good answer", () => {
    expect(run([{ type: "send" }]).status).toBe("reading");
    expect(run([{ type: "send" }, { type: "read", activity }])).toEqual({
      status: "reading",
      activity,
    });
    expect(run([{ type: "send" }, { type: "stream" }]).status).toBe(
      "streaming",
    );
    expect(
      run([{ type: "send" }, { type: "stream" }, { type: "done" }]),
    ).toEqual({
      status: "idle",
      error: null,
    });
  });

  it("keeps the error and its code after a failure", () => {
    const state = run([
      { type: "send" },
      { type: "failed", error: "Used", code: "free_question_spent" },
    ]);
    expect(describeBookMindRequest(state)).toMatchObject({
      isLoading: false,
      isStreaming: false,
      error: "Used",
      errorCode: "free_question_spent",
    });
  });

  it("clears an old error when a new request starts", () => {
    const state = run([{ type: "failed", error: "Old" }, { type: "send" }]);
    expect(describeBookMindRequest(state).error).toBeNull();
  });

  it("never reports loading and streaming at once", () => {
    const events: BookMindRequestEvent[] = [
      { type: "send" },
      { type: "read", activity },
      { type: "stream" },
      { type: "read", activity },
      { type: "send" },
      { type: "stream" },
      { type: "stopped" },
    ];
    let state = initialBookMindRequest;
    for (const event of events) {
      state = bookMindRequest(state, event);
      const view = describeBookMindRequest(state);
      expect(view.isLoading && view.isStreaming).toBe(false);
    }
  });

  it("ignores side errors while a request is running", () => {
    const state = run([
      { type: "send" },
      { type: "sideFailed", error: "Inline" },
    ]);
    expect(state.status).toBe("reading");
    expect(run([{ type: "sideFailed", error: "Inline" }])).toEqual({
      status: "idle",
      error: "Inline",
    });
  });

  it("ignores reading and streaming events when idle", () => {
    expect(run([{ type: "read", activity }])).toEqual(initialBookMindRequest);
    expect(run([{ type: "stream" }])).toEqual(initialBookMindRequest);
  });
});
