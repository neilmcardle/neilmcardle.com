import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  eventStore,
  mediaQueryStore,
  useBrowserStore,
  type BrowserStore,
} from "./browserStore";

function mount<T>(store: BrowserStore<T>) {
  const seen: { current: T | null } = { current: null };
  let renders = 0;
  function Probe() {
    renders += 1;
    seen.current = useBrowserStore(store);
    return null;
  }
  const root: Root = createRoot(document.createElement("div"));
  act(() => root.render(createElement(Probe)));
  return {
    seen,
    get renders() {
      return renders;
    },
    unmount: () => act(() => root.unmount()),
  };
}

interface FakeList {
  matches: boolean;
  addEventListener: (
    type: string,
    fn: (e: MediaQueryListEvent) => void,
  ) => void;
  removeEventListener: (
    type: string,
    fn: (e: MediaQueryListEvent) => void,
  ) => void;
}

function installMatchMedia(matches: boolean) {
  const handlers = new Set<(e: MediaQueryListEvent) => void>();
  const list: FakeList = {
    matches,
    addEventListener: (_type, fn) => handlers.add(fn),
    removeEventListener: (_type, fn) => handlers.delete(fn),
  };
  const matchMedia = vi.fn(() => list as unknown as MediaQueryList);
  Object.defineProperty(window, "matchMedia", {
    value: matchMedia,
    configurable: true,
    writable: true,
  });
  return {
    matchMedia,
    handlers,
    emit(next: boolean) {
      list.matches = next;
      for (const fn of handlers) fn({ matches: next } as MediaQueryListEvent);
    },
  };
}

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => vi.restoreAllMocks());

describe("eventStore", () => {
  it("reads the browser value once and caches it", () => {
    const read = vi.fn(() => "granted");
    const store = eventStore({
      events: ["x"],
      read,
      server: null as string | null,
    });
    const view = mount(store);
    expect(view.seen.current).toBe("granted");
    expect(read).toHaveBeenCalledTimes(1);
    view.unmount();
  });

  it("re-reads and re-renders when the event fires", () => {
    let value = "denied";
    const store = eventStore({
      events: ["consent"],
      read: () => value,
      server: null as string | null,
    });
    const view = mount(store);
    expect(view.seen.current).toBe("denied");
    value = "granted";
    act(() => {
      window.dispatchEvent(new Event("consent"));
    });
    expect(view.seen.current).toBe("granted");
    view.unmount();
  });

  it("does not re-render when the value is unchanged", () => {
    const store = eventStore({
      events: ["ping"],
      read: () => "same",
      server: "same",
    });
    const view = mount(store);
    const before = view.renders;
    act(() => {
      window.dispatchEvent(new Event("ping"));
    });
    expect(view.renders).toBe(before);
    view.unmount();
  });

  it("keeps working for a second subscriber after the first unmounts", () => {
    let value = "a";
    const store = eventStore({
      events: ["tick"],
      read: () => value,
      server: "a",
    });
    const first = mount(store);
    const second = mount(store);
    first.unmount();
    value = "b";
    act(() => {
      window.dispatchEvent(new Event("tick"));
    });
    expect(second.seen.current).toBe("b");
    second.unmount();
  });

  it("serves the server value with no window value cached", () => {
    const store = eventStore({
      events: ["x"],
      read: () => "client",
      server: "server",
    });
    expect(store.getServerSnapshot()).toBe("server");
  });
});

describe("mediaQueryStore", () => {
  it("reports the live match rather than the server default", () => {
    installMatchMedia(true);
    const store = mediaQueryStore("(prefers-reduced-motion: reduce)", false);
    const view = mount(store);
    expect(view.seen.current).toBe(true);
    view.unmount();
  });

  it("updates when the query changes", () => {
    const media = installMatchMedia(false);
    const store = mediaQueryStore("(hover: none)", false);
    const view = mount(store);
    expect(view.seen.current).toBe(false);
    act(() => media.emit(true));
    expect(view.seen.current).toBe(true);
    view.unmount();
  });

  it("detaches its listener once nothing is subscribed", () => {
    const media = installMatchMedia(false);
    const store = mediaQueryStore("(pointer: coarse)", false);
    const view = mount(store);
    expect(media.handlers.size).toBe(1);
    view.unmount();
    expect(media.handlers.size).toBe(0);
  });

  it("returns the same store for the same query", () => {
    installMatchMedia(false);
    const a = mediaQueryStore("(min-width: 600px)", false);
    const b = mediaQueryStore("(min-width: 600px)", false);
    expect(a).toBe(b);
  });
});
