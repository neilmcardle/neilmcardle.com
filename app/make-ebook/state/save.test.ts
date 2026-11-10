import { describe, expect, it } from "vitest";
import { isSaveFailure, mergeSaveRequests, snapshotsVersion } from "./save";

describe("save results", () => {
  it("only counts a save that actually failed as a failure", () => {
    expect(isSaveFailure("failed")).toBe(true);
    expect(isSaveFailure("saved")).toBe(false);
    expect(isSaveFailure("blank")).toBe(false);
  });

  it("only snapshots a version when the save really ran", () => {
    expect(snapshotsVersion("saved")).toBe(true);
    expect(snapshotsVersion("blank")).toBe(false);
    expect(snapshotsVersion("failed")).toBe(false);
  });

  it("merges queued saves, keeping the stronger request", () => {
    expect(
      mergeSaveRequests(
        { forceNewVersion: false, cloud: "later" },
        { forceNewVersion: false, cloud: "now" },
      ),
    ).toEqual({ forceNewVersion: false, cloud: "now" });
    expect(
      mergeSaveRequests(
        { forceNewVersion: true, cloud: "later" },
        { forceNewVersion: false, cloud: "later" },
      ),
    ).toEqual({ forceNewVersion: true, cloud: "later" });
  });
});
