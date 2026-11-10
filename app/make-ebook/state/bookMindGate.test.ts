import { describe, expect, it } from "vitest";
import { bookMindGate } from "./bookMindGate";

const base = {
  tierKnown: true,
  isPro: false,
  trialUsed: false,
  busy: false,
  hasChapters: true,
};

describe("bookMindGate", () => {
  it("asks a free writer who used the trial to upgrade, for retries too", () => {
    expect(bookMindGate({ ...base, trialUsed: true })).toBe("upgrade");
  });

  it("lets a free writer ask the one free question", () => {
    expect(bookMindGate(base)).toBe("send");
  });

  it("never treats a Pro writer as on the trial", () => {
    expect(bookMindGate({ ...base, isPro: true, trialUsed: true })).toBe(
      "send",
    );
  });

  it("does not lock anyone out while the tier is still unknown", () => {
    expect(bookMindGate({ ...base, tierKnown: false, trialUsed: true })).toBe(
      "send",
    );
  });

  it("waits while busy or when there are no chapters", () => {
    expect(bookMindGate({ ...base, busy: true })).toBe("wait");
    expect(bookMindGate({ ...base, hasChapters: false })).toBe("wait");
  });
});
