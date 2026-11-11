import { describe, expect, it } from "vitest";
import {
  finishSync,
  initialSyncGate,
  initialSyncStatus,
  requestSync,
  syncStatus,
  type SyncGate,
} from "./syncStatus";

const ask = (
  gate: SyncGate,
  over: Partial<{ force: boolean; now: number; hasUser: boolean }> = {},
) =>
  requestSync(gate, {
    force: false,
    now: 100000,
    throttleMs: 10000,
    hasUser: true,
    ...over,
  });

describe("requestSync", () => {
  it("runs the first sync and remembers when", () => {
    const { gate, run } = ask(initialSyncGate);
    expect(run).toBe(true);
    expect(gate.running).toBe(true);
    expect(gate.lastAt).toBe(100000);
  });

  it("throttles an unforced sync within ten seconds", () => {
    const done = finishSync(ask(initialSyncGate).gate).gate;
    expect(ask(done, { now: 105000 }).run).toBe(false);
    expect(ask(done, { now: 111000 }).run).toBe(true);
    expect(ask(done, { now: 105000, force: true }).run).toBe(true);
  });

  it("queues one rerun when a forced sync arrives mid-sync", () => {
    const running = ask(initialSyncGate).gate;
    const asked = ask(running, { force: true });
    expect(asked.run).toBe(false);
    expect(asked.gate.rerun).toBe(true);
    const finished = finishSync(asked.gate);
    expect(finished.rerun).toBe(true);
    expect(finished.gate.rerun).toBe(false);
    expect(finished.gate.running).toBe(false);
  });

  it("drops an unforced sync mid-sync without queueing", () => {
    const running = ask(initialSyncGate).gate;
    expect(ask(running).gate.rerun).toBe(false);
  });

  it("waits while conflicts are open", () => {
    const gate = { ...initialSyncGate, conflictsOpen: true };
    expect(ask(gate, { force: true }).run).toBe(false);
    expect(ask(gate, { force: true }).gate.rerun).toBe(false);
  });

  it("does not run without a user and does not start the throttle", () => {
    const { gate, run } = ask(initialSyncGate, { hasUser: false });
    expect(run).toBe(false);
    expect(gate.lastAt).toBe(0);
  });
});

describe("syncStatus", () => {
  it("marks the first sync done once, by a finish or the fallback", () => {
    const start = initialSyncStatus<string, number>();
    expect(start.initialDone).toBe(false);
    const done = syncStatus(start, { type: "finished" });
    expect(done.initialDone).toBe(true);
    expect(syncStatus(done, { type: "timedOut" })).toBe(done);
    expect(syncStatus(start, { type: "timedOut" }).initialDone).toBe(true);
  });

  it("holds conflicts with the merged library until each is resolved", () => {
    const merged = new Map([["a", 1]]);
    let state = syncStatus(initialSyncStatus<string, number>(), {
      type: "conflicts",
      conflicts: ["a", "b"],
      merged,
    });
    expect(state.conflicts).toEqual(["a", "b"]);
    state = syncStatus(state, {
      type: "resolved",
      remaining: ["b"],
      merged,
    });
    expect(state.conflicts).toEqual(["b"]);
    expect(state.merged).toBe(merged);
    state = syncStatus(state, { type: "resolved", remaining: [], merged });
    expect(state.conflicts).toEqual([]);
    expect(state.merged).toBeNull();
  });
});
