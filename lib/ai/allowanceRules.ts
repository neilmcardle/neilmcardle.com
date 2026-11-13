export type AllowanceKind = "brief" | "question";

export const ALLOWANCE_PERIOD_DAYS: Record<AllowanceKind, number | null> = {
  brief: 30,
  question: null,
};

const DAY = 24 * 60 * 60 * 1000;

export type AllowanceState =
  { state: "available" } | { state: "spent"; resetsAt: Date | null };

export function allowanceState(
  kind: AllowanceKind,
  usedAt: Date | null | undefined,
  now: Date = new Date(),
): AllowanceState {
  if (!usedAt) return { state: "available" };
  const days = ALLOWANCE_PERIOD_DAYS[kind];
  if (days === null) return { state: "spent", resetsAt: null };
  const resetsAt = new Date(usedAt.getTime() + days * DAY);
  return resetsAt <= now
    ? { state: "available" }
    : { state: "spent", resetsAt };
}

export function availableSince(
  kind: AllowanceKind,
  now: Date = new Date(),
): Date | null {
  const days = ALLOWANCE_PERIOD_DAYS[kind];
  return days === null ? null : new Date(now.getTime() - days * DAY);
}
