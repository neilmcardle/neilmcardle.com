export type SubscriptionTier = "free" | "pro";
export type SubscriptionStatus =
  "active" | "trialing" | "canceled" | "past_due" | "incomplete" | null;

export interface SubscriptionSnapshot {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  isGrandfathered: boolean;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  isPro: boolean;
}

export interface SubscriptionState {
  phase: "loading" | "known" | "failed";
  request: number;
  userId: string | null;
  snapshot: SubscriptionSnapshot | null;
  error: string | null;
  awaitingUpgrade: boolean;
}

export type SubscriptionEvent =
  | { type: "signedOut" }
  | { type: "fetch"; request: number; userId: string }
  | { type: "loaded"; request: number; data: SubscriptionSnapshot }
  | { type: "failed"; request: number; error: string }
  | { type: "expectUpgrade" }
  | { type: "gaveUp" };

export const FREE_SNAPSHOT: SubscriptionSnapshot = {
  tier: "free",
  status: null,
  isGrandfathered: false,
  currentPeriodEnd: null,
  stripeCustomerId: null,
  isPro: false,
};

export const initialSubscription: SubscriptionState = {
  phase: "loading",
  request: 0,
  userId: null,
  snapshot: null,
  error: null,
  awaitingUpgrade: false,
};

export function subscription(
  state: SubscriptionState,
  event: SubscriptionEvent,
): SubscriptionState {
  switch (event.type) {
    case "signedOut":
      return {
        phase: "known",
        request: state.request + 1,
        userId: null,
        snapshot: FREE_SNAPSHOT,
        error: null,
        awaitingUpgrade: false,
      };
    case "fetch": {
      const sameUser = state.userId === event.userId;
      return {
        phase: sameUser && state.snapshot ? state.phase : "loading",
        request: event.request,
        userId: event.userId,
        snapshot: sameUser ? state.snapshot : null,
        error: null,
        awaitingUpgrade:
          sameUser || state.userId === null ? state.awaitingUpgrade : false,
      };
    }
    case "loaded":
      if (event.request !== state.request) return state;
      return {
        ...state,
        phase: "known",
        snapshot: event.data,
        error: null,
        awaitingUpgrade: state.awaitingUpgrade && !event.data.isPro,
      };
    case "failed":
      if (event.request !== state.request) return state;
      return state.snapshot
        ? { ...state, error: event.error }
        : { ...state, phase: "failed", error: event.error };
    case "expectUpgrade":
      return { ...state, awaitingUpgrade: true };
    case "gaveUp":
      return { ...state, awaitingUpgrade: false };
  }
}

export function describeSubscription(state: SubscriptionState) {
  const snapshot = state.snapshot ?? FREE_SNAPSHOT;
  return {
    ...snapshot,
    tierKnown:
      state.phase === "known" && !!state.snapshot && !state.awaitingUpgrade,
    isLoading: state.phase === "loading",
    awaitingUpgrade: state.awaitingUpgrade,
    error: state.error,
  };
}
