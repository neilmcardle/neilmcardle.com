import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  keys,
  readLocal,
  removeLocal,
  subscribeLocal,
  writeLocal,
} from "./keys";

const name = keys.bookMindExpanded();

beforeEach(() => {
  window.localStorage.clear();
});

describe("local storage listeners", () => {
  it("tells a listener when its key is written and removed", () => {
    const listener = vi.fn();
    const stop = subscribeLocal(name.key, listener);
    writeLocal(name, "1");
    expect(readLocal(name)).toBe("1");
    removeLocal(name);
    expect(listener).toHaveBeenCalledTimes(2);
    stop();
  });

  it("leaves listeners on other keys alone", () => {
    const listener = vi.fn();
    const stop = subscribeLocal(keys.flowMode().key, listener);
    writeLocal(name, "1");
    expect(listener).not.toHaveBeenCalled();
    stop();
  });

  it("stops telling a listener once it unsubscribes", () => {
    const listener = vi.fn();
    subscribeLocal(name.key, listener)();
    writeLocal(name, "1");
    expect(listener).not.toHaveBeenCalled();
  });
});
