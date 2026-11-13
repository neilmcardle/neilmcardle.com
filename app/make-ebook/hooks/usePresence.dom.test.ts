import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePresence } from "./usePresence";

type Result = ReturnType<typeof usePresence>;

function mount(open: boolean) {
  const seen: { current: Result | null } = { current: null };
  function Probe({ open }: { open: boolean }) {
    seen.current = usePresence(open, 100);
    return null;
  }
  const root: Root = createRoot(document.createElement("div"));
  const render = (next: boolean) =>
    act(() => root.render(createElement(Probe, { open: next })));
  render(open);
  return { seen, render, unmount: () => act(() => root.unmount()) };
}

describe("usePresence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });
  afterEach(() => vi.useRealTimers());

  it("mounts as soon as it opens", () => {
    const view = mount(false);
    expect(view.seen.current?.mounted).toBe(false);
    view.render(true);
    expect(view.seen.current).toEqual({ mounted: true, state: "open" });
    view.unmount();
  });

  it("stays mounted while it leaves, then unmounts", () => {
    const view = mount(true);
    view.render(false);
    expect(view.seen.current).toEqual({ mounted: true, state: "closed" });
    act(() => vi.advanceTimersByTime(99));
    expect(view.seen.current?.mounted).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(view.seen.current?.mounted).toBe(false);
    view.unmount();
  });

  it("cancels the exit when it reopens", () => {
    const view = mount(true);
    view.render(false);
    act(() => vi.advanceTimersByTime(50));
    view.render(true);
    act(() => vi.advanceTimersByTime(200));
    expect(view.seen.current).toEqual({ mounted: true, state: "open" });
    view.unmount();
  });
});
