import { describe, expect, it } from "vitest";
import {
  shouldApplySubscription,
  storedStatus,
  subscriptionFields,
} from "./entitlement";

describe("storedStatus", () => {
  it("keeps the statuses the app knows", () => {
    for (const s of [
      "active",
      "trialing",
      "past_due",
      "incomplete",
      "canceled",
    ]) {
      expect(storedStatus(s)).toBe(s);
    }
  });

  it("maps Stripe-only statuses to safe ones", () => {
    expect(storedStatus("unpaid")).toBe("past_due");
    expect(storedStatus("incomplete_expired")).toBe("canceled");
    expect(storedStatus("paused")).toBe("canceled");
    expect(storedStatus("something_new")).toBe("canceled");
  });
});

describe("shouldApplySubscription", () => {
  const current = {
    stripeSubscriptionId: "sub_new",
    subscriptionStatus: "active",
  };

  it("applies events for the user's current subscription", () => {
    expect(
      shouldApplySubscription(current, { id: "sub_new", status: "canceled" }),
    ).toBe(true);
  });

  it("ignores an old subscription ending, so it cannot downgrade the current one", () => {
    expect(
      shouldApplySubscription(current, { id: "sub_old", status: "canceled" }),
    ).toBe(false);
  });

  it("lets a new live subscription replace an old one", () => {
    expect(
      shouldApplySubscription(
        { stripeSubscriptionId: "sub_old", subscriptionStatus: "canceled" },
        { id: "sub_new", status: "active" },
      ),
    ).toBe(true);
  });

  it("applies the first subscription a user has", () => {
    expect(
      shouldApplySubscription({}, { id: "sub_1", status: "trialing" }),
    ).toBe(true);
  });
});

describe("subscriptionFields", () => {
  it("gives Pro only to live subscriptions", () => {
    expect(
      subscriptionFields({ id: "s", status: "trialing" }).subscriptionTier,
    ).toBe("pro");
    expect(
      subscriptionFields({ id: "s", status: "past_due" }).subscriptionTier,
    ).toBe("free");
    expect(
      subscriptionFields({ id: "s", status: "canceled" }).subscriptionTier,
    ).toBe("free");
  });

  it("converts the period end to a date", () => {
    expect(
      subscriptionFields({
        id: "s",
        status: "active",
        periodEnd: 1_800_000_000,
      }).subscriptionCurrentPeriodEnd?.toISOString(),
    ).toBe("2027-01-15T08:00:00.000Z");
  });
});
