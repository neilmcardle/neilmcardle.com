import { describe, expect, it } from "vitest";
import {
  describeExport,
  exportFlow,
  initialExport,
  type ExportState,
} from "./exportFlow";

describe("exportFlow", () => {
  it("blocks a second export while one is running", () => {
    const running = exportFlow(initialExport, {
      type: "start",
      format: "epub",
    });
    expect(running).toEqual({ status: "exporting", format: "epub" });
    expect(exportFlow(running, { type: "start", format: "pdf" })).toBe(running);
  });

  it("reports a failure with its message and allows a retry", () => {
    let state: ExportState = exportFlow(initialExport, {
      type: "start",
      format: "epub",
    });
    state = exportFlow(state, { type: "failed", error: "Out of memory" });
    expect(describeExport(state)).toEqual({
      exporting: false,
      exportError: "Out of memory",
    });
    state = exportFlow(state, { type: "start", format: "epub" });
    expect(state.status).toBe("exporting");
  });

  it("goes back to idle when an export finishes or the error is dismissed", () => {
    const running = exportFlow(initialExport, {
      type: "start",
      format: "docx",
    });
    expect(exportFlow(running, { type: "done" })).toEqual(initialExport);
    const failed = exportFlow(running, { type: "failed", error: "x" });
    expect(exportFlow(failed, { type: "dismiss" })).toEqual(initialExport);
  });

  it("ignores done and failed when nothing is exporting", () => {
    expect(exportFlow(initialExport, { type: "done" })).toBe(initialExport);
    expect(exportFlow(initialExport, { type: "failed", error: "x" })).toBe(
      initialExport,
    );
  });
});
