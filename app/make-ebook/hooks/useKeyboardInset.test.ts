import { describe, expect, it } from "vitest";
import { caretScroll, keyboardIsOpen } from "./useKeyboardInset";

describe("keyboard inset", () => {
  it("sees the keyboard even after Safari pans the page up", () => {
    expect(keyboardIsOpen(750, 400)).toBe(true);
    expect(keyboardIsOpen(750, 740)).toBe(false);
  });

  it("scrolls a caret hidden behind the toolbar back into view", () => {
    expect(
      caretScroll({ top: 380, bottom: 400 }, { top: 60, bottom: 350 }),
    ).toBe(78);
  });

  it("scrolls a caret above the visible area back down", () => {
    expect(caretScroll({ top: 40, bottom: 60 }, { top: 60, bottom: 350 })).toBe(
      -48,
    );
  });

  it("leaves a visible caret alone", () => {
    expect(
      caretScroll({ top: 200, bottom: 220 }, { top: 60, bottom: 350 }),
    ).toBe(0);
  });
});
