export type CheckoutPlan = "monthly" | "lifetime";

export type Checkout =
  | { status: "idle"; plan: CheckoutPlan }
  | { status: "redirecting"; plan: CheckoutPlan }
  | { status: "failed"; plan: CheckoutPlan; error: string };

export type CheckoutEvent =
  | { type: "open" }
  | { type: "choose"; plan: CheckoutPlan }
  | { type: "start" }
  | { type: "failed"; error: string }
  | { type: "restored" };

export const initialCheckout: Checkout = { status: "idle", plan: "monthly" };

export function checkout(state: Checkout, event: CheckoutEvent): Checkout {
  switch (event.type) {
    case "open":
      return state.status === "redirecting" ? state : initialCheckout;
    case "choose":
      return state.status === "redirecting"
        ? state
        : { status: "idle", plan: event.plan };
    case "start":
      return state.status === "redirecting"
        ? state
        : { status: "redirecting", plan: state.plan };
    case "failed":
      return { status: "failed", plan: state.plan, error: event.error };
    case "restored":
      return state.status === "redirecting"
        ? { status: "idle", plan: state.plan }
        : state;
  }
}
