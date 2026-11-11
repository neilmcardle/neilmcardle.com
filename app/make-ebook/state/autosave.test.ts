import { describe, expect, it } from "vitest";
import {
  autosave,
  autosaveDelay,
  initialAutosave,
  isSaveOk,
  type Autosave,
} from "./autosave";

describe("autosave", () => {
  it("remembers when the first unsaved edit happened", () => {
    const one = autosave(initialAutosave, { type: "edited", at: 1000 });
    const two = autosave(one, { type: "edited", at: 5000 });
    expect(two.isDirty).toBe(true);
    expect(two.firstDirtyAt).toBe(1000);
    expect(two.edits).toBe(2);
  });

  it("is clean after a save of the latest edit", () => {
    let state: Autosave = autosave(initialAutosave, { type: "edited", at: 1 });
    state = autosave(state, { type: "saveStarted" });
    state = autosave(state, { type: "saved", at: 9000, current: true });
    expect(state.isDirty).toBe(false);
    expect(state.isSaving).toBe(false);
    expect(state.lastSaved?.getTime()).toBe(9000);
  });

  it("stays dirty and restarts the wait when edits arrived during a save", () => {
    let state: Autosave = autosave(initialAutosave, { type: "edited", at: 1 });
    state = autosave(state, { type: "saved", at: 9000, current: false });
    expect(state.isDirty).toBe(true);
    expect(state.firstDirtyAt).toBe(9000);
    expect(state.attempt).toBe(1);
  });

  it("counts failures, marks them and schedules a retry", () => {
    let state: Autosave = autosave(initialAutosave, { type: "edited", at: 1 });
    state = autosave(state, { type: "saveStarted" });
    state = autosave(state, { type: "saveFinished", ok: false });
    expect(state.hasFailed).toBe(true);
    expect(state.failures).toBe(1);
    expect(state.attempt).toBe(1);
    state = autosave(state, { type: "saved", at: 2, current: true });
    expect(state.failures).toBe(0);
    expect(state.hasFailed).toBe(false);
  });

  it("does not count a successful save as a failure", () => {
    const state = autosave(autosave(initialAutosave, { type: "saveStarted" }), {
      type: "saveFinished",
      ok: true,
    });
    expect(state.failures).toBe(0);
    expect(state.isSaving).toBe(false);
  });
});

describe("autosaveDelay", () => {
  it("waits the interval after the latest edit", () => {
    expect(
      autosaveDelay({ failures: 0, firstDirtyAt: 1000 }, 1500, 2000, 20000),
    ).toBe(2000);
  });

  it("never waits past the longest wait since the first edit", () => {
    expect(
      autosaveDelay({ failures: 0, firstDirtyAt: 0 }, 19000, 2000, 20000),
    ).toBe(1000);
    expect(
      autosaveDelay({ failures: 0, firstDirtyAt: 0 }, 25000, 2000, 20000),
    ).toBe(0);
  });

  it("backs off after failures, up to two minutes", () => {
    const at = (failures: number) =>
      autosaveDelay({ failures, firstDirtyAt: 0 }, 0, 2000, 20000);
    expect(at(1)).toBe(15000);
    expect(at(2)).toBe(30000);
    expect(at(4)).toBe(120000);
    expect(at(8)).toBe(120000);
  });
});

describe("isSaveOk", () => {
  it("treats false and failed as failures only", () => {
    expect(isSaveOk("saved")).toBe(true);
    expect(isSaveOk("blank")).toBe(true);
    expect(isSaveOk(undefined)).toBe(true);
    expect(isSaveOk(false)).toBe(false);
    expect(isSaveOk("failed")).toBe(false);
  });
});
