import { describe, expect, it } from "vitest";
import {
  idleRemote,
  initialPaging,
  paging,
  remote,
  remoteData,
  remoteFailed,
  type Paging,
  type PagingEvent,
  type Remote,
  type RemoteEvent,
} from "./remote";

const pages = (events: PagingEvent[]) =>
  events.reduce<Paging>(paging, initialPaging);
const fetches = (events: RemoteEvent<string>[]) =>
  events.reduce<Remote<string>>(remote, idleRemote);

describe("coverly paging", () => {
  it("stops after a failed page instead of retrying forever", () => {
    const state = pages([{ type: "load" }, { type: "fail" }, { type: "load" }]);
    expect(state).toEqual({ status: "error", page: 0 });
  });

  it("retries a failed page only when asked", () => {
    const state = pages([
      { type: "load" },
      { type: "fail" },
      { type: "retry" },
      { type: "loaded", added: 24, more: true },
    ]);
    expect(state).toEqual({ status: "idle", page: 1 });
  });

  it("can't load the same page twice at once", () => {
    const loading = pages([{ type: "load" }]);
    expect(paging(loading, { type: "load" })).toBe(loading);
  });

  it("finishes when a page adds nothing new", () => {
    const state = pages([
      { type: "load" },
      { type: "loaded", added: 0, more: true },
    ]);
    expect(state.status).toBe("done");
  });
});

describe("coverly detail fetch", () => {
  it("shows an error, not a skeleton forever, when the fetch fails", () => {
    const state = fetches([
      { type: "load", key: "a" },
      { type: "fail", key: "a" },
    ]);
    expect(remoteFailed(state, "a")).toBe(true);
    expect(remoteData(state, "a")).toBeNull();
  });

  it("retries the same cover", () => {
    const state = fetches([
      { type: "load", key: "a" },
      { type: "fail", key: "a" },
      { type: "retry" },
      { type: "ready", key: "a", data: "detail" },
    ]);
    expect(remoteData(state, "a")).toBe("detail");
  });

  it("ignores a slow answer for a cover that is no longer open", () => {
    const state = fetches([
      { type: "load", key: "a" },
      { type: "load", key: "b" },
      { type: "ready", key: "a", data: "old" },
    ]);
    expect(state).toEqual({ status: "loading", key: "b", attempt: 0 });
  });
});
