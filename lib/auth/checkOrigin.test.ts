import { describe, expect, it } from "vitest";
import { checkOrigin } from "./checkOrigin";

function req(method: string, origin?: string) {
  return new Request("https://neilmcardle.com/api/x", {
    method,
    headers: origin ? { origin } : {},
  });
}

describe("checkOrigin", () => {
  it("allows the site's own origins", () => {
    expect(checkOrigin(req("POST", "https://neilmcardle.com"))).toBeNull();
    expect(checkOrigin(req("POST", "https://makeebook.ink"))).toBeNull();
  });

  it("refuses other origins", () => {
    expect(checkOrigin(req("POST", "https://evil.com"))?.status).toBe(403);
  });

  it("refuses a POST with no origin", () => {
    expect(checkOrigin(req("POST"))?.status).toBe(403);
  });

  it("allows a GET with no origin", () => {
    expect(checkOrigin(req("GET"))).toBeNull();
  });
});
