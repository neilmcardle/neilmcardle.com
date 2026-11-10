import { describe, expect, it } from "vitest";
import {
  exportStatus,
  noSnip,
  snip,
  snipOwnsSave,
  snipRect,
  type ExportEvent,
  type ExportStatus,
  type Snip,
  type SnipEvent,
} from "./canvas-state";

const snips = (events: SnipEvent[], from: Snip = noSnip) =>
  events.reduce(snip, from);
const exports = (events: ExportEvent[]) =>
  events.reduce<ExportStatus>(exportStatus, { status: "idle" });

describe("doodlewire snip", () => {
  it("draws, selects and saves a region", () => {
    const selected = snips([
      { type: "begin", at: { x: 40, y: 40 } },
      { type: "drag", at: { x: 10, y: 90 } },
      { type: "end" },
    ]);
    expect(selected).toEqual({
      phase: "selected",
      rect: { x: 10, y: 40, w: 30, h: 50 },
    });
    const saving = snips([{ type: "save", run: 1 }], selected);
    expect(snipOwnsSave(saving, 1)).toBe(true);
    expect(snips([{ type: "saved", run: 1 }], saving)).toEqual(noSnip);
  });

  it("drops a tiny drag", () => {
    expect(
      snips([
        { type: "begin", at: { x: 0, y: 0 } },
        { type: "drag", at: { x: 3, y: 30 } },
        { type: "end" },
      ]),
    ).toEqual(noSnip);
  });

  it("a save that finishes after the user moved on doesn't own the canvas", () => {
    const state = snips([
      { type: "begin", at: { x: 0, y: 0 } },
      { type: "drag", at: { x: 50, y: 50 } },
      { type: "end" },
      { type: "save", run: 4 },
      { type: "cancel" },
    ]);
    expect(snipOwnsSave(state, 4)).toBe(false);
    expect(snips([{ type: "saved", run: 4 }], state)).toBe(state);
    expect(snipRect(state)).toBeNull();
  });

  it("keeps the selection when the save dialog is cancelled", () => {
    const state = snips([
      { type: "begin", at: { x: 0, y: 0 } },
      { type: "drag", at: { x: 50, y: 50 } },
      { type: "end" },
      { type: "save", run: 2 },
      { type: "saved", run: 2, keep: true },
    ]);
    expect(state.phase).toBe("selected");
  });
});

describe("doodlewire export status", () => {
  it("is never downloading and failed at once", () => {
    const state = exports([{ type: "start" }, { type: "fail", error: "No" }]);
    expect(state).toEqual({ status: "error", error: "No" });
    expect(exportStatus(state, { type: "start" })).toEqual({
      status: "downloading",
    });
  });

  it("a late settle doesn't clear a new download", () => {
    const state = exports([
      { type: "start" },
      { type: "done", result: "downloaded" },
      { type: "start" },
      { type: "settle" },
    ]);
    expect(state).toEqual({ status: "downloading" });
  });
});
