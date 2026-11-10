"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { useAuth } from "./useAuth";
import {
  describeSubscription,
  initialSubscription,
  subscription,
  type SubscriptionSnapshot,
} from "./subscriptionState";

export type { SubscriptionTier, SubscriptionStatus } from "./subscriptionState";

const UPGRADE_POLL_MS = 2000;
const UPGRADE_POLL_ATTEMPTS = 8;

type SubscriptionData = ReturnType<typeof describeSubscription> & {
  expectUpgrade: () => void;
};

const SubscriptionContext = createContext<SubscriptionData | undefined>(
  undefined,
);

function toSnapshot(
  result: Partial<SubscriptionSnapshot>,
): SubscriptionSnapshot {
  return {
    tier: result.tier || "free",
    status: result.status || null,
    isGrandfathered: result.isGrandfathered || false,
    currentPeriodEnd: result.currentPeriodEnd || null,
    stripeCustomerId: result.stripeCustomerId || null,
    isPro: result.isPro || false,
  };
}

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(subscription, initialSubscription);
  const requestRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchTier = useCallback(async (userId: string, retryFree: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const request = ++requestRef.current;
    dispatch({ type: "fetch", request, userId });

    const load = async () => {
      const response = await fetch("/api/subscription", {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Failed to fetch subscription data");
      return toSnapshot(await response.json());
    };

    try {
      let data = await load();
      if (retryFree && !data.isPro && data.tier === "free") {
        await new Promise((r) => setTimeout(r, 1000));
        if (controller.signal.aborted) return;
        data = await load();
      }
      dispatch({ type: "loaded", request, data });
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error("Error fetching subscription:", error);
      dispatch({
        type: "failed",
        request,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load subscription",
      });
    }
  }, []);

  const userId = user?.id;
  const hasEmail = !!user?.email;

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !userId) {
      abortRef.current?.abort();
      requestRef.current += 1;
      dispatch({ type: "signedOut" });
      return;
    }
    void fetchTier(userId, hasEmail);
  }, [userId, hasEmail, isAuthenticated, authLoading, fetchTier]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const awaiting = state.awaitingUpgrade;
  const awaitingUserId = state.userId;

  useEffect(() => {
    if (!awaiting || !awaitingUserId) return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (attempts > UPGRADE_POLL_ATTEMPTS) {
        clearInterval(timer);
        dispatch({ type: "gaveUp" });
        return;
      }
      void fetchTier(awaitingUserId, false);
    }, UPGRADE_POLL_MS);
    return () => clearInterval(timer);
  }, [awaiting, awaitingUserId, fetchTier]);

  const expectUpgrade = useCallback(
    () => dispatch({ type: "expectUpgrade" }),
    [],
  );

  const value = useMemo(
    () => ({ ...describeSubscription(state), expectUpgrade }),
    [state, expectUpgrade],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
}

export function useIsPro() {
  const { isPro } = useSubscription();
  return isPro;
}

export function useFeatureAccess(
  feature: "book_mind_ai" | "cloud_sync" | "version_history" | "export_history",
) {
  const { tier } = useSubscription();

  const proFeatures = ["book_mind_ai", "cloud_sync"];

  if (proFeatures.includes(feature)) {
    return tier === "pro";
  }

  return true;
}
