export interface ProFields {
  isGrandfathered?: boolean | null;
  hasLifetimeAccess?: boolean | null;
  subscriptionStatus?: string | null;
  subscriptionTier?: string | null;
}

export const PRO_STATUSES: ReadonlyArray<string> = ["active", "trialing"];

export function hasProSubscription(
  user: ProFields | null | undefined,
): boolean {
  return (
    !!user &&
    user.subscriptionTier === "pro" &&
    !!user.subscriptionStatus &&
    PRO_STATUSES.includes(user.subscriptionStatus)
  );
}

export function isProUser(user: ProFields | null | undefined): boolean {
  if (!user) return false;
  if (user.isGrandfathered || user.hasLifetimeAccess) return true;
  return hasProSubscription(user);
}

export function devProEmails(): string[] {
  if (process.env.NODE_ENV !== "development") return [];
  return (process.env.DEV_PRO_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
