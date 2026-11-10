import { describe, expect, it } from "vitest";
import { safeNext } from "./safeNext";

const origin = "https://neilmcardle.com";

describe("safeNext", () => {
  it("keeps paths on this site", () => {
    expect(safeNext("/coverly/boards?x=1#a", origin)).toBe(
      "/coverly/boards?x=1#a",
    );
  });

  it.each([
    null,
    "",
    "//evil.com",
    "/\\evil.com",
    "/\\/evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "/\t/evil.com",
  ])("sends %j back to Coverly", (raw) => {
    expect(safeNext(raw, origin)).toBe("/coverly");
  });
});
