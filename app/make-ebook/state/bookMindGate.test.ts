import { describe, expect, it } from "vitest";
import { bookMindGate } from "./bookMindGate";

const base = {
  tierKnown: true,
  isPro: false,
  freeQuestionUsed: false,
  busy: false,
  hasChapters: true,
};

describe("bookMindGate", () => {
  it("asks a free writer who used the free question to upgrade, for retries too", () => {
    expect(bookMindGate({ ...base, freeQuestionUsed: true })).toBe("upgrade");
  });

  it("lets a free writer ask the one free question", () => {
    expect(bookMindGate(base)).toBe("send");
  });

  it("never treats a Pro writer as on the free question", () => {
    expect(bookMindGate({ ...base, isPro: true, freeQuestionUsed: true })).toBe(
      "send",
    );
  });

  it("does not lock anyone out while the tier is still unknown", () => {
    expect(
      bookMindGate({ ...base, tierKnown: false, freeQuestionUsed: true }),
    ).toBe("send");
  });

  it("waits while busy or when there are no chapters", () => {
    expect(bookMindGate({ ...base, busy: true })).toBe("wait");
    expect(bookMindGate({ ...base, hasChapters: false })).toBe("wait");
  });
});
