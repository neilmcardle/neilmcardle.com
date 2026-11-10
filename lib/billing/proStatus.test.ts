import { describe, expect, it } from "vitest";
import { hasProSubscription, isProUser } from "./proStatus";

describe("isProUser", () => {
  it("is false for no user", () => {
    expect(isProUser(null)).toBe(false);
    expect(isProUser(undefined)).toBe(false);
  });

  it("counts active and trialing Pro subscriptions", () => {
    expect(
      isProUser({ subscriptionTier: "pro", subscriptionStatus: "active" }),
    ).toBe(true);
    expect(
      isProUser({ subscriptionTier: "pro", subscriptionStatus: "trialing" }),
    ).toBe(true);
  });

  it.each(["canceled", "past_due", "incomplete", null])(
    "does not count a %s subscription",
    (status) => {
      expect(
        isProUser({ subscriptionTier: "pro", subscriptionStatus: status }),
      ).toBe(false);
    },
  );

  it("needs the Pro tier, not only an active status", () => {
    expect(
      hasProSubscription({
        subscriptionTier: "free",
        subscriptionStatus: "active",
      }),
    ).toBe(false);
  });

  it("counts grandfathered and lifetime users", () => {
    expect(isProUser({ isGrandfathered: true })).toBe(true);
    expect(isProUser({ hasLifetimeAccess: true })).toBe(true);
  });
});
