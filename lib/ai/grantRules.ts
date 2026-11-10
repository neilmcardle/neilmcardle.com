export type GrantKind = "brief" | "question";

export const GRANT_PERIOD_DAYS: Record<GrantKind, number | null> = {
  brief: 30,
  question: null,
};

const DAY = 24 * 60 * 60 * 1000;

export type GrantState =
  { state: "available" } | { state: "spent"; resetsAt: Date | null };

export function grantState(
  kind: GrantKind,
  usedAt: Date | null | undefined,
  now: Date = new Date(),
): GrantState {
  if (!usedAt) return { state: "available" };
  const days = GRANT_PERIOD_DAYS[kind];
  if (days === null) return { state: "spent", resetsAt: null };
  const resetsAt = new Date(usedAt.getTime() + days * DAY);
  return resetsAt <= now
    ? { state: "available" }
    : { state: "spent", resetsAt };
}

export function availableSince(
  kind: GrantKind,
  now: Date = new Date(),
): Date | null {
  const days = GRANT_PERIOD_DAYS[kind];
  return days === null ? null : new Date(now.getTime() - days * DAY);
}
