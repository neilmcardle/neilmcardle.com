import { describe, expect, it } from "vitest";
import { availableSince, allowanceState } from "./allowanceRules";

const now = new Date("2026-11-10T12:00:00Z");

describe("allowanceState", () => {
  it("is available before it is used", () => {
    expect(allowanceState("brief", null, now)).toEqual({ state: "available" });
    expect(allowanceState("question", null, now)).toEqual({
      state: "available",
    });
  });

  it("gives the brief back after 30 days", () => {
    const used = new Date("2026-10-01T12:00:00Z");
    expect(allowanceState("brief", used, now)).toEqual({ state: "available" });
    const recent = new Date("2026-11-01T12:00:00Z");
    expect(allowanceState("brief", recent, now)).toEqual({
      state: "spent",
      resetsAt: new Date("2026-12-01T12:00:00Z"),
    });
  });

  it("never gives the free question back", () => {
    const used = new Date("2020-01-01T00:00:00Z");
    expect(allowanceState("question", used, now)).toEqual({
      state: "spent",
      resetsAt: null,
    });
  });
});

describe("availableSince", () => {
  it("is 30 days back for the brief and none for the question", () => {
    expect(availableSince("brief", now)?.toISOString()).toBe(
      "2026-10-11T12:00:00.000Z",
    );
    expect(availableSince("question", now)).toBeNull();
  });
});
