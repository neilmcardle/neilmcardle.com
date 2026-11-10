import { describe, expect, it } from "vitest";
import {
  describeSubscription,
  initialSubscription,
  subscription,
  type SubscriptionState,
} from "./subscriptionState";

const pro = {
  tier: "pro" as const,
  status: "active" as const,
  isGrandfathered: false,
  currentPeriodEnd: null,
  stripeCustomerId: "cus_1",
  isPro: true,
};
const free = {
  tier: "free" as const,
  status: null,
  isGrandfathered: false,
  currentPeriodEnd: null,
  stripeCustomerId: null,
  isPro: false,
};

function run(
  events: Parameters<typeof subscription>[1][],
  from: SubscriptionState = initialSubscription,
) {
  return events.reduce(subscription, from);
}

describe("subscription", () => {
  it("is unknown while loading, not free", () => {
    const state = run([{ type: "fetch", request: 1, userId: "u1" }]);
    expect(describeSubscription(state)).toMatchObject({
      tierKnown: false,
      isLoading: true,
      isPro: false,
    });
  });

  it("does not map a failed fetch to a known free tier", () => {
    const state = run([
      { type: "fetch", request: 1, userId: "u1" },
      { type: "failed", request: 1, error: "Network" },
    ]);
    expect(describeSubscription(state)).toMatchObject({
      tierKnown: false,
      isLoading: false,
      error: "Network",
    });
  });

  it("ignores a stale answer after the user switches", () => {
    const state = run([
      { type: "fetch", request: 1, userId: "u1" },
      { type: "fetch", request: 2, userId: "u2" },
      { type: "loaded", request: 1, data: pro },
    ]);
    expect(describeSubscription(state)).toMatchObject({
      tierKnown: false,
      isPro: false,
    });
  });

  it("drops the previous user's tier when a new user starts loading", () => {
    const state = run([
      { type: "fetch", request: 1, userId: "u1" },
      { type: "loaded", request: 1, data: pro },
      { type: "fetch", request: 2, userId: "u2" },
    ]);
    expect(describeSubscription(state).isPro).toBe(false);
  });

  it("keeps the tier while the same user refetches", () => {
    const state = run([
      { type: "fetch", request: 1, userId: "u1" },
      { type: "loaded", request: 1, data: pro },
      { type: "fetch", request: 2, userId: "u1" },
    ]);
    expect(describeSubscription(state)).toMatchObject({
      tierKnown: true,
      isPro: true,
    });
  });

  it("waits for the upgrade after checkout until the tier arrives", () => {
    let state = run([
      { type: "fetch", request: 1, userId: "u1" },
      { type: "loaded", request: 1, data: free },
      { type: "expectUpgrade" },
    ]);
    expect(describeSubscription(state)).toMatchObject({
      awaitingUpgrade: true,
      tierKnown: false,
    });
    state = run(
      [
        { type: "fetch", request: 2, userId: "u1" },
        { type: "loaded", request: 2, data: free },
      ],
      state,
    );
    expect(describeSubscription(state).awaitingUpgrade).toBe(true);
    state = run(
      [
        { type: "fetch", request: 3, userId: "u1" },
        { type: "loaded", request: 3, data: pro },
      ],
      state,
    );
    expect(describeSubscription(state)).toMatchObject({
      awaitingUpgrade: false,
      tierKnown: true,
      isPro: true,
    });
  });

  it("gives up waiting and shows the tier the server last sent", () => {
    const state = run([
      { type: "fetch", request: 1, userId: "u1" },
      { type: "loaded", request: 1, data: free },
      { type: "expectUpgrade" },
      { type: "gaveUp" },
    ]);
    expect(describeSubscription(state)).toMatchObject({
      awaitingUpgrade: false,
      tierKnown: true,
      isPro: false,
    });
  });

  it("keeps waiting for the upgrade when checkout returns before the user is known", () => {
    const state = run([
      { type: "expectUpgrade" },
      { type: "fetch", request: 1, userId: "u1" },
      { type: "loaded", request: 1, data: free },
    ]);
    expect(describeSubscription(state).awaitingUpgrade).toBe(true);
  });

  it("stops waiting for an upgrade when the user changes", () => {
    const state = run([
      { type: "fetch", request: 1, userId: "u1" },
      { type: "expectUpgrade" },
      { type: "fetch", request: 2, userId: "u2" },
    ]);
    expect(describeSubscription(state).awaitingUpgrade).toBe(false);
  });

  it("is a known free tier when signed out", () => {
    const state = run([{ type: "signedOut" }]);
    expect(describeSubscription(state)).toMatchObject({
      tierKnown: true,
      isLoading: false,
      tier: "free",
    });
  });
});
