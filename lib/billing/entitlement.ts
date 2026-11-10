import { PRO_STATUSES } from "./proStatus";

export type StoredStatus =
  "active" | "trialing" | "canceled" | "past_due" | "incomplete";

const STATUS_MAP: Record<string, StoredStatus> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  unpaid: "past_due",
  incomplete: "incomplete",
  incomplete_expired: "canceled",
  canceled: "canceled",
  paused: "canceled",
};

export function storedStatus(stripeStatus: string): StoredStatus {
  return STATUS_MAP[stripeStatus] ?? "canceled";
}

export function isLiveStatus(status: string | null | undefined): boolean {
  return !!status && PRO_STATUSES.includes(storedStatus(status));
}

export interface IncomingSubscription {
  id: string;
  status: string;
  periodEnd?: number | null;
  priceId?: string | null;
}

export interface CurrentSubscription {
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
}

export function shouldApplySubscription(
  current: CurrentSubscription,
  incoming: IncomingSubscription,
): boolean {
  if (!current.stripeSubscriptionId) return true;
  if (current.stripeSubscriptionId === incoming.id) return true;
  return isLiveStatus(incoming.status);
}

export function subscriptionFields(incoming: IncomingSubscription) {
  const status = storedStatus(incoming.status);
  const periodEnd =
    typeof incoming.periodEnd === "number" && incoming.periodEnd > 0
      ? new Date(incoming.periodEnd * 1000)
      : undefined;
  return {
    stripeSubscriptionId: incoming.id,
    subscriptionStatus: status,
    subscriptionTier: (isLiveStatus(status) ? "pro" : "free") as "pro" | "free",
    subscriptionCurrentPeriodEnd: periodEnd,
    stripePriceId: incoming.priceId ?? undefined,
  };
}
