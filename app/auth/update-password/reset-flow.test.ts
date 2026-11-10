import { describe, expect, it } from "vitest";
import { initialResetFlow, resetFlow, type ResetFlowEvent } from "./reset-flow";

const run = (events: ResetFlowEvent[]) =>
  events.reduce(resetFlow, initialResetFlow);

describe("update password flow", () => {
  it("keeps a link-check error out of the form", () => {
    const state = run([
      { type: "linkBad", reason: "Invalid or expired reset link" },
      { type: "submit" },
    ]);
    expect(state).toEqual({
      phase: "invalid",
      reason: "Invalid or expired reset link",
    });
  });

  it("shows form errors on the form and lets the user try again", () => {
    const state = run([
      { type: "linkOk" },
      { type: "reject", error: "Passwords do not match" },
      { type: "submit" },
      { type: "failed", error: "Failed to update password" },
    ]);
    expect(state).toEqual({
      phase: "ready",
      error: "Failed to update password",
    });
  });

  it("can't submit twice", () => {
    const state = run([
      { type: "linkOk" },
      { type: "submit" },
      { type: "submit" },
      { type: "saved" },
    ]);
    expect(state).toEqual({ phase: "done" });
  });
});
