import { describe, expect, it } from "vitest";
import {
  describeDocumentImport,
  documentImport,
  initialDocumentImport,
  type DocumentImport,
  type DocumentImportEvent,
} from "./documentImport";

function run(events: DocumentImportEvent[]) {
  return events.reduce<DocumentImport>(documentImport, initialDocumentImport);
}

describe("documentImport", () => {
  it("opens, imports and closes on success", () => {
    expect(run([{ type: "open" }]).status).toBe("open");
    expect(run([{ type: "open" }, { type: "start" }]).status).toBe("importing");
    expect(
      run([{ type: "open" }, { type: "start" }, { type: "done" }]).status,
    ).toBe("closed");
  });

  it("shows the dialog with the error when an import fails, even if it was closed", () => {
    const state = run([
      { type: "start" },
      { type: "failed", error: "Bad file" },
    ]);
    expect(describeDocumentImport(state)).toEqual({
      importDialogOpen: true,
      importing: false,
      importError: "Bad file",
    });
  });

  it("clears the error when the dialog opens again", () => {
    const state = run([
      { type: "start" },
      { type: "failed", error: "Bad file" },
      { type: "close" },
      { type: "open" },
    ]);
    expect(describeDocumentImport(state).importError).toBeNull();
  });

  it("can't be closed halfway through an import", () => {
    expect(run([{ type: "start" }, { type: "close" }]).status).toBe(
      "importing",
    );
  });
});
