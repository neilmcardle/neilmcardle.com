import { describe, expect, it } from "vitest";
import {
  closePanel,
  closePopup,
  closeSheet,
  closeTop,
  noOverlays,
  openPanel,
  openPopup,
  openSheet,
} from "./overlays";

describe("overlays", () => {
  it("keeps one sheet, one panel and one popup at a time", () => {
    let state = openSheet(openSheet(noOverlays, "mobileSidebar"), "chapters");
    state = openPanel(openPanel(state, { kind: "newBook" }), {
      kind: "history",
      view: "exports",
    });
    state = openPopup(openPopup(state, { kind: "upgrade" }), {
      kind: "epubReader",
    });
    expect(state).toEqual({
      sheet: "chapters",
      panel: { kind: "history", view: "exports" },
      popup: { kind: "epubReader" },
    });
  });

  it("keeps a panel open under the reader it opened", () => {
    const history = openPanel(noOverlays, { kind: "history", view: "exports" });
    const reading = openPopup(history, { kind: "epubReader" });
    expect(closePopup(reading, "epubReader")).toEqual(history);
  });

  it("keeps pre-flight open under the upgrade prompt", () => {
    const preflight = openPanel(noOverlays, {
      kind: "preflight",
      format: "epub",
    });
    const upgrade = openPopup(preflight, { kind: "upgrade" });
    expect(closePopup(upgrade, "upgrade")).toEqual(preflight);
  });

  it("only closes the item that asked", () => {
    const state = openPopup(openSheet(noOverlays, "chapters"), {
      kind: "upgrade",
    });
    expect(closeSheet(state, "mobileSidebar")).toBe(state);
    expect(closePanel(state, "newBook")).toBe(state);
    expect(closePopup(state, "upgrade").popup).toBeNull();
  });

  it("closes the top layer first", () => {
    const state = openPopup(
      openPanel(openSheet(noOverlays, "chapters"), { kind: "newBook" }),
      { kind: "upgrade" },
    );
    expect(closeTop(state).popup).toBeNull();
    expect(closeTop(closeTop(state)).panel).toBeNull();
    expect(closeTop(closeTop(closeTop(state)))).toEqual(noOverlays);
  });
});
