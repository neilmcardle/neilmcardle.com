import { describe, expect, it } from "vitest";
import {
  bookSwitch,
  initialBookSwitch,
  isCurrentSwitch,
  type BookSwitch,
} from "./bookSwitch";

describe("bookSwitch", () => {
  it("gives every switch a new token", () => {
    const one = bookSwitch(initialBookSwitch, { type: "begin" });
    const two = bookSwitch(one, { type: "begin" });
    expect(two.token).toBe(one.token + 1);
  });

  it("lets only the latest of two quick clicks apply", () => {
    let state: BookSwitch = bookSwitch(initialBookSwitch, { type: "begin" });
    const first = state.token;
    state = bookSwitch(state, { type: "begin" });
    const second = state.token;
    expect(isCurrentSwitch(state, first)).toBe(false);
    expect(isCurrentSwitch(state, second)).toBe(true);
    state = bookSwitch(state, { type: "applied", token: first });
    expect(state.pending).toBe(second);
  });

  it("drops a pending load when a new book or import starts", () => {
    let state = bookSwitch(initialBookSwitch, { type: "begin" });
    const load = state.token;
    state = bookSwitch(state, { type: "begin" });
    expect(isCurrentSwitch(state, load)).toBe(false);
  });

  it("clears the pending switch once it applies", () => {
    let state = bookSwitch(initialBookSwitch, { type: "begin" });
    state = bookSwitch(state, { type: "applied", token: state.token });
    expect(state.pending).toBeNull();
  });
});
