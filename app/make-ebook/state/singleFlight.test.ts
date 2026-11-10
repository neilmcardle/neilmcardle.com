import { describe, expect, it } from "vitest";
import { createSingleFlight, flights, type Flights } from "./singleFlight";

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

const now = (fn: () => void) => fn();
const join = (a: number, b: number) => a + b;

describe("flights", () => {
  it("runs a request at once when nothing is in flight for that key", () => {
    const step = flights<number>(
      {},
      { type: "request", key: "a", payload: 1 },
      join,
    );
    expect(step.run).toBe(1);
    expect(step.state).toEqual({ a: { queued: null } });
  });

  it("queues a request behind one in flight and merges a second into it", () => {
    let state: Flights<number> = { a: { queued: null } };
    let step = flights(state, { type: "request", key: "a", payload: 2 }, join);
    expect(step.run).toBeNull();
    state = step.state;
    step = flights(state, { type: "request", key: "a", payload: 3 }, join);
    expect(step.state).toEqual({ a: { queued: 5 } });
  });

  it("runs the queued follow-up once when the flight finishes, then goes idle", () => {
    let step = flights<number>(
      { a: { queued: 4 } },
      { type: "finish", key: "a" },
      join,
    );
    expect(step.run).toBe(4);
    step = flights(step.state, { type: "finish", key: "a" }, join);
    expect(step.run).toBeNull();
    expect(step.state).toEqual({});
  });

  it("keeps keys apart", () => {
    const step = flights<number>(
      { a: { queued: null } },
      { type: "request", key: "b", payload: 1 },
      join,
    );
    expect(step.run).toBe(1);
  });
});

describe("createSingleFlight", () => {
  it("gives a caller queued behind a flight the follow-up's result, not a failure", async () => {
    const first = deferred<string>();
    const calls: number[] = [];
    const flight = createSingleFlight<number, string>({
      run: (_key, payload) => {
        calls.push(payload);
        return calls.length === 1 ? first.promise : Promise.resolve("saved");
      },
      merge: join,
      failed: "failed",
      defer: now,
    });
    const a = flight.request("save", 1);
    const b = flight.request("save", 2);
    const c = flight.request("save", 3);
    first.resolve("saved");
    expect(await a).toBe("saved");
    expect(await b).toBe("saved");
    expect(await c).toBe("saved");
    expect(calls).toEqual([1, 5]);
  });

  it("runs the follow-up with whatever runner is current when it starts", async () => {
    const first = deferred<string>();
    let latest = "old text";
    const seen: string[] = [];
    const flight = createSingleFlight<number, string>({
      run: () => {
        seen.push(latest);
        return seen.length === 1 ? first.promise : Promise.resolve("saved");
      },
      merge: join,
      failed: "failed",
      defer: now,
    });
    void flight.request("save", 1);
    const queued = flight.request("save", 1);
    latest = "new endnote";
    first.resolve("saved");
    await queued;
    expect(seen).toEqual(["old text", "new endnote"]);
  });

  it("turns a thrown run into the failed result and frees the key", async () => {
    const flight = createSingleFlight<number, string>({
      run: async () => {
        throw new Error("boom");
      },
      merge: join,
      failed: "failed",
      defer: now,
    });
    expect(await flight.request("k", 1)).toBe("failed");
    expect(flight.isBusy("k")).toBe(false);
  });

  it("lets two books push to the cloud at the same time, but one book only once at a time", async () => {
    const gates: Record<string, ReturnType<typeof deferred<boolean>>> = {
      a: deferred<boolean>(),
      b: deferred<boolean>(),
    };
    const started: string[] = [];
    const flight = createSingleFlight<true, boolean>({
      run: (key) => {
        started.push(key);
        return started.filter((k) => k === key).length === 1
          ? gates[key].promise
          : Promise.resolve(true);
      },
      merge: () => true,
      failed: false,
      defer: now,
    });
    const a1 = flight.request("a", true);
    const a2 = flight.request("a", true);
    const b1 = flight.request("b", true);
    expect(started).toEqual(["a", "b"]);
    gates.a.resolve(true);
    gates.b.resolve(true);
    await Promise.all([a1, a2, b1]);
    expect(started).toEqual(["a", "b", "a"]);
  });
});
