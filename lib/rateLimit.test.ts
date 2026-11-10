import { describe, expect, it, vi } from "vitest";
import { clientIp, hit, waitPhrase } from "./rateLimit";

vi.mock("@/lib/db", () => ({
  db: { execute: () => Promise.reject(new Error("no database in tests")) },
}));

describe("hit", () => {
  it("allows up to the limit, then refuses", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const key = `test:${Math.random()}`;
    const results = [];
    for (let i = 0; i < 4; i++)
      results.push((await hit(key, 3, 60_000)).allowed);
    expect(results).toEqual([true, true, true, false]);
  });

  it("keeps separate counts per key", async () => {
    const a = `a:${Math.random()}`;
    const b = `b:${Math.random()}`;
    await hit(a, 1, 60_000);
    expect((await hit(a, 1, 60_000)).allowed).toBe(false);
    expect((await hit(b, 1, 60_000)).allowed).toBe(true);
  });
});

describe("waitPhrase", () => {
  it("reads naturally", () => {
    expect(waitPhrase(30)).toBe("a minute");
    expect(waitPhrase(600)).toBe("10 minutes");
    expect(waitPhrase(3600)).toBe("an hour");
    expect(waitPhrase(7200)).toBe("2 hours");
  });
});

describe("clientIp", () => {
  it("takes the first forwarded address", () => {
    const req = new Request("https://x.test", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to unknown", () => {
    expect(clientIp(new Request("https://x.test"))).toBe("unknown");
  });
});
