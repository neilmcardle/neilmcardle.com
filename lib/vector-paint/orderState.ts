export const ORDER_STATUSES = [
  "pending",
  "paid",
  "submitted",
  "dry_run",
  "failed",
  "unconfirmed",
  "refunded",
  "expired",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderEvent =
  | "pay"
  | "reclaim"
  | "submit"
  | "dry_run"
  | "fail"
  | "unconfirm"
  | "refund"
  | "expire"
  | "abandon";

export const ORDER_TRANSITIONS: Record<
  OrderEvent,
  { from: readonly OrderStatus[]; to: OrderStatus }
> = {
  pay: { from: ["pending", "failed", "expired"], to: "paid" },
  reclaim: { from: ["paid"], to: "paid" },
  submit: { from: ["paid"], to: "submitted" },
  dry_run: { from: ["paid"], to: "dry_run" },
  fail: { from: ["paid"], to: "failed" },
  unconfirm: { from: ["paid"], to: "unconfirmed" },
  refund: {
    from: [
      "pending",
      "paid",
      "submitted",
      "dry_run",
      "failed",
      "unconfirmed",
      "expired",
    ],
    to: "refunded",
  },
  expire: { from: ["pending"], to: "expired" },
  abandon: { from: ["pending"], to: "expired" },
};

export const UNPAID_STATUSES: readonly OrderStatus[] = ["pending", "expired"];

export const PAID_STATUSES: readonly OrderStatus[] = [
  "paid",
  "submitted",
  "dry_run",
  "failed",
  "unconfirmed",
  "refunded",
];

export function canTransition(from: OrderStatus, event: OrderEvent): boolean {
  return ORDER_TRANSITIONS[event].from.includes(from);
}

export function nextStatus(
  from: OrderStatus,
  event: OrderEvent,
): OrderStatus | null {
  return canTransition(from, event) ? ORDER_TRANSITIONS[event].to : null;
}
