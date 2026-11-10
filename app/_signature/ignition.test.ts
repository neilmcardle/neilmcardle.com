import { describe, expect, it, vi } from "vitest";
import {
  describeIgnition,
  ignition,
  initialIgnition,
  retryable,
  type Ignition,
  type IgnitionEvent,
} from "./ignition";

const run = (events: IgnitionEvent[], from: Ignition = initialIgnition) =>
  events.reduce(ignition, from);

describe("finale ignition", () => {
  it("opens, runs and reveals", () => {
    const state = run([
      { type: "open" },
      { type: "ignite" },
      { type: "loaded", ok: true },
      { type: "finished" },
    ]);
    expect(state).toEqual({ phase: "revealed", open: true, closeSoon: true });
    expect(describeIgnition(state)).toMatchObject({
      revealed: true,
      said: true,
      running: false,
    });
  });

  it("stays open while the engine runs, even if the pointer leaves", () => {
    const state = run([
      { type: "open" },
      { type: "ignite" },
      { type: "loaded", ok: true },
      { type: "close" },
    ]);
    expect(describeIgnition(state)).toMatchObject({
      open: true,
      running: true,
    });
  });

  it("can't start twice", () => {
    const loading = run([{ type: "open" }, { type: "ignite" }]);
    expect(run([{ type: "ignite" }], loading)).toBe(loading);
  });

  it("reveals the address without the run when the sound fails", () => {
    const state = run([
      { type: "open" },
      { type: "ignite" },
      { type: "loaded", ok: false },
    ]);
    expect(describeIgnition(state)).toMatchObject({
      revealed: true,
      said: true,
      running: false,
    });
  });

  it("cancels the close-after-run when the cover is opened again", () => {
    const state = run([
      { type: "ignite" },
      { type: "loaded", ok: true },
      { type: "finished" },
      { type: "open" },
    ]);
    expect(state).toEqual({ phase: "revealed", open: true, closeSoon: false });
  });
});

describe("retryable engine sound", () => {
  it("fetches again after a failure instead of keeping the rejected promise", async () => {
    const load = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce("sound");
    const get = retryable(load);
    await expect(get()).rejects.toThrow("offline");
    await expect(get()).resolves.toBe("sound");
    await expect(get()).resolves.toBe("sound");
    expect(load).toHaveBeenCalledTimes(2);
  });
});
