import { describe, expect, it } from "vitest";
import { checkout, initialCheckout, type Checkout } from "./checkout";

describe("checkout", () => {
  it("clears the error and plan when the modal opens again", () => {
    let state: Checkout = checkout(initialCheckout, {
      type: "choose",
      plan: "lifetime",
    });
    state = checkout(state, { type: "start" });
    state = checkout(state, { type: "failed", error: "Card declined" });
    state = checkout(state, { type: "open" });
    expect(state).toEqual(initialCheckout);
  });

  it("stops loading when the page comes back from Stripe", () => {
    let state = checkout(initialCheckout, { type: "start" });
    expect(state.status).toBe("redirecting");
    state = checkout(state, { type: "restored" });
    expect(state.status).toBe("idle");
  });

  it("ignores a second start while redirecting", () => {
    const state = checkout(initialCheckout, { type: "start" });
    expect(checkout(state, { type: "start" })).toBe(state);
  });

  it("keeps the chosen plan on a failure", () => {
    let state = checkout(initialCheckout, { type: "choose", plan: "lifetime" });
    state = checkout(state, { type: "start" });
    state = checkout(state, { type: "failed", error: "Nope" });
    expect(state).toEqual({
      status: "failed",
      plan: "lifetime",
      error: "Nope",
    });
  });
});
