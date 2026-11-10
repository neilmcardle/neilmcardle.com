export type SaveResult = "saved" | "blank" | "failed";

export interface SaveRequest {
  forceNewVersion: boolean;
  cloud: "now" | "later";
}

export function mergeSaveRequests(a: SaveRequest, b: SaveRequest): SaveRequest {
  return {
    forceNewVersion: a.forceNewVersion || b.forceNewVersion,
    cloud: a.cloud === "now" || b.cloud === "now" ? "now" : "later",
  };
}

export function isSaveFailure(result: SaveResult) {
  return result === "failed";
}

export function snapshotsVersion(result: SaveResult) {
  return result === "saved";
}
