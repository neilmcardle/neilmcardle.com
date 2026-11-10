import { describe, expect, it } from "vitest";
import {
  ORDER_STATUSES,
  ORDER_TRANSITIONS,
  PAID_STATUSES,
  UNPAID_STATUSES,
  canTransition,
  nextStatus,
} from "./orderState";

describe("vector paint order transitions", () => {
  it("only sends a print for an order that is paid and in hand", () => {
    for (const from of ORDER_STATUSES) {
      expect(canTransition(from, "submit")).toBe(from === "paid");
    }
  });

  it("never lets a refunded order be submitted, failed or paid again", () => {
    for (const event of [
      "submit",
      "dry_run",
      "fail",
      "unconfirm",
      "pay",
    ] as const) {
      expect(nextStatus("refunded", event)).toBeNull();
    }
  });

  it("refunds an order that is still being sent", () => {
    expect(nextStatus("paid", "refund")).toBe("refunded");
  });

  it("does not refund twice", () => {
    expect(canTransition("refunded", "refund")).toBe(false);
  });

  it("marks a checkout that never started as unpaid, not as a failed print", () => {
    expect(nextStatus("pending", "abandon")).toBe("expired");
    expect(UNPAID_STATUSES).toContain(nextStatus("pending", "abandon"));
  });

  it("puts every status in exactly one retention group", () => {
    for (const status of ORDER_STATUSES) {
      const groups = [UNPAID_STATUSES, PAID_STATUSES].filter((g) =>
        g.includes(status),
      );
      expect(groups).toHaveLength(1);
    }
  });

  it("only moves to known statuses", () => {
    for (const { from, to } of Object.values(ORDER_TRANSITIONS)) {
      expect(ORDER_STATUSES).toContain(to);
      for (const f of from) expect(ORDER_STATUSES).toContain(f);
    }
  });
});
