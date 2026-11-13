import { describe, expect, it } from "vitest";
import { easeOut } from "./motion";

describe("easeOut", () => {
  it("starts at 0 and ends at 1", () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
  });

  it("covers most of the distance in the first half", () => {
    expect(easeOut(0.5)).toBeGreaterThan(0.9);
  });

  it("never runs backwards", () => {
    let last = 0;
    for (let i = 1; i <= 100; i++) {
      const v = easeOut(i / 100);
      expect(v).toBeGreaterThanOrEqual(last - 1e-9);
      last = v;
    }
  });
});
