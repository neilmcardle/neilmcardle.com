import { describe, expect, it } from "vitest";
import {
  appPhase,
  initialAppPhase,
  isHydrated,
  showsLanding,
  type AppPhase,
  type AppPhaseEvent,
} from "./appPhase";

function run(...events: AppPhaseEvent["type"][]): AppPhase {
  return events.reduce<AppPhase>(
    (phase, type) => appPhase(phase, { type } as AppPhaseEvent),
    initialAppPhase,
  );
}

describe("appPhase", () => {
  it("shows the landing while auth is still loading", () => {
    expect(showsLanding(initialAppPhase)).toBe(true);
    expect(isHydrated(initialAppPhase)).toBe(false);
  });

  it("stays on the landing for a signed-out visitor", () => {
    const phase = run("noUser");
    expect(phase).toEqual({ kind: "marketing", hydrated: false });
    expect(showsLanding(phase)).toBe(true);
  });

  it("goes from booting to choosing once a signed-in library is ready", () => {
    const signedIn = run("signedIn");
    expect(signedIn).toEqual({ kind: "booting", landing: false });
    expect(showsLanding(signedIn)).toBe(false);
    expect(run("signedIn", "hydrated")).toEqual({ kind: "choosing" });
  });

  it("loads, then opens a book", () => {
    const loading = run("signedIn", "hydrated", "loadStarted");
    expect(loading).toEqual({ kind: "loading", from: "choosing", pending: 1 });
    expect(appPhase(loading, { type: "opened" })).toEqual({ kind: "ready" });
  });

  it("returns to where it was when a load finds nothing", () => {
    expect(run("signedIn", "hydrated", "loadStarted", "loadAbandoned")).toEqual(
      { kind: "choosing" },
    );
    expect(
      run("signedIn", "hydrated", "opened", "loadStarted", "loadAbandoned"),
    ).toEqual({ kind: "ready" });
  });

  it("keeps loading while a newer switch is still running", () => {
    const phase = run(
      "signedIn",
      "hydrated",
      "loadStarted",
      "loadStarted",
      "loadAbandoned",
    );
    expect(phase.kind).toBe("loading");
    expect(appPhase(phase, { type: "opened" })).toEqual({ kind: "ready" });
  });

  it("ignores a late abandoned load after another book opened", () => {
    expect(
      run("signedIn", "hydrated", "loadStarted", "opened", "loadAbandoned"),
    ).toEqual({ kind: "ready" });
  });

  it("goes back to choosing when the editor goes home", () => {
    expect(run("signedIn", "hydrated", "opened", "closed")).toEqual({
      kind: "choosing",
    });
  });

  it("shows the landing after sign out and remembers the library was read", () => {
    const phase = run("signedIn", "hydrated", "opened", "signedOut");
    expect(phase).toEqual({ kind: "marketing", hydrated: true });
    expect(isHydrated(phase)).toBe(true);
    expect(appPhase(phase, { type: "signedIn" })).toEqual({ kind: "choosing" });
  });

  it("leaves the landing for the editor on start writing", () => {
    expect(run("noUser", "startWriting")).toEqual({
      kind: "booting",
      landing: false,
    });
    expect(run("signedIn", "hydrated", "signedOut", "startWriting")).toEqual({
      kind: "choosing",
    });
  });

  it("opens a linked book before the landing would show", () => {
    expect(run("startWriting", "hydrated", "loadStarted", "opened")).toEqual({
      kind: "ready",
    });
  });

  it("does not treat a load before hydration as hydrated", () => {
    expect(run("noUser", "opened")).toEqual({
      kind: "booting",
      landing: false,
    });
  });
});
