import { describe, expect, it } from "vitest";
import {
  SUGGESTION_STATUSES,
  canTransition,
  reportEvent,
  runToken,
} from "./buildState";

describe("suggestion build transitions", () => {
  it("cannot reject a build that is running or already live", () => {
    expect(canTransition("building", "reject")).toBe(false);
    expect(canTransition("live", "reject")).toBe(false);
    expect(canTransition("ready", "reject")).toBe(true);
  });

  it("only takes a report for a build that is running", () => {
    for (const status of SUGGESTION_STATUSES) {
      expect(canTransition(status, "report_ready")).toBe(status === "building");
    }
  });

  it("only goes live from ready", () => {
    for (const status of SUGGESTION_STATUSES) {
      expect(canTransition(status, "go_live")).toBe(status === "ready");
    }
  });

  it("retries only new or failed suggestions", () => {
    expect(canTransition("failed", "build")).toBe(true);
    expect(canTransition("rejected", "build")).toBe(false);
    expect(canTransition("building", "build")).toBe(false);
  });

  it("reads a report with a pull request as ready", () => {
    expect(reportEvent("https://github.com/x/y/pull/1")).toBe("report_ready");
    expect(reportEvent(null)).toBe("report_failed");
  });

  it("gives each run its own token", () => {
    expect(runToken(new Date(1_000))).toBe("1000");
    expect(runToken(new Date(2_000))).not.toBe(runToken(new Date(1_000)));
    expect(runToken(null)).toBe("");
  });
});
