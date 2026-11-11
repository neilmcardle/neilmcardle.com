import { describe, expect, it } from "vitest";
import { COLLECTION, PLAY, WORK, WRITING } from "../_home/data";
import {
  ENTRIES,
  initialJump,
  jump,
  matchEntries,
  selected,
  type JumpEvent,
  type JumpState,
} from "./jump";

const run = (events: JumpEvent[], from: JumpState = initialJump) =>
  events.reduce(jump, from);

const opened = (query = "") =>
  run([{ type: "open" }, { type: "query", value: query }]);

const PIECES = [...WORK, ...WRITING, ...PLAY, ...COLLECTION];

describe("jump registry", () => {
  it("carries every piece of work and nothing else", () => {
    expect(ENTRIES.length).toBe(
      WORK.length + WRITING.length + PLAY.length + COLLECTION.length,
    );
  });

  it("restates no title, href or kind of its own", () => {
    for (const entry of ENTRIES) {
      const piece = PIECES.find((candidate) => candidate.id === entry.id);
      expect(piece).toBeDefined();
      expect(entry.title).toBe(piece?.title);
      expect(entry.href).toBe(piece?.href);
      expect(entry.kind).toBe(piece?.kind);
    }
  });

  it("keeps registry order, so the list a visitor learned does not shuffle", () => {
    expect(ENTRIES.map((entry) => entry.id)).toEqual(
      PIECES.map((piece) => piece.id),
    );
  });
});

describe("matchEntries", () => {
  it("matches title, kind and line, case-insensitively", () => {
    const titles = matchEntries(ENTRIES, WORK[0].title.toUpperCase());
    expect(titles.map((entry) => entry.id)).toContain(WORK[0].id);

    const kinds = matchEntries(ENTRIES, WORK[0].kind.toLowerCase());
    expect(kinds.every((entry) => entry.kind === WORK[0].kind)).toBe(true);

    const line = WORK[0].line ?? "";
    expect(matchEntries(ENTRIES, line).map((entry) => entry.id)).toContain(
      WORK[0].id,
    );
  });

  it("returns everything for an empty or blank query", () => {
    expect(matchEntries(ENTRIES, "")).toHaveLength(ENTRIES.length);
    expect(matchEntries(ENTRIES, "   ")).toHaveLength(ENTRIES.length);
  });

  it("filters without re-sorting", () => {
    const matches = matchEntries(ENTRIES, "o");
    const order = ENTRIES.filter((entry) => matches.includes(entry));
    expect(matches).toEqual(order);
  });

  it("returns nothing for a query no piece carries", () => {
    expect(matchEntries(ENTRIES, "zzzzqqq")).toEqual([]);
  });

  it("filters a thousand times inside the latency budget", () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i += 1) matchEntries(ENTRIES, "co");
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
  });
});

describe("jump reducer", () => {
  it("opens", () => {
    expect(jump(initialJump, { type: "open" }).open).toBe(true);
  });

  it("closes from any state, clearing the query and the position", () => {
    const dirty = run(
      [
        { type: "query", value: "co" },
        { type: "move", delta: 2 },
      ],
      { open: true, query: "", index: 3 },
    );
    expect(jump(dirty, { type: "close" })).toEqual({
      open: false,
      query: "",
      index: 0,
    });
    expect(jump(initialJump, { type: "close" })).toEqual(initialJump);
  });

  it("wraps forwards from the last match to the first", () => {
    const last = { open: true, query: "", index: ENTRIES.length - 1 };
    expect(jump(last, { type: "move", delta: 1 }).index).toBe(0);
  });

  it("wraps backwards from the first match to the last", () => {
    const first = { open: true, query: "", index: 0 };
    expect(jump(first, { type: "move", delta: -1 }).index).toBe(
      ENTRIES.length - 1,
    );
  });

  it("wraps against the filtered count, not the whole registry", () => {
    const query = WORK[0].kind;
    const count = matchEntries(ENTRIES, query).length;
    expect(count).toBeLessThan(ENTRIES.length);
    const state = { open: true, query, index: count - 1 };
    expect(jump(state, { type: "move", delta: 1 }).index).toBe(0);
  });

  it("sends the position back to the first match on every keystroke", () => {
    const moved = run([{ type: "open" }, { type: "move", delta: 3 }]);
    expect(moved.index).toBe(3);
    expect(jump(moved, { type: "query", value: "a" }).index).toBe(0);
  });

  it("holds the position at zero while nothing matches", () => {
    const empty = opened("zzzzqqq");
    expect(jump(empty, { type: "move", delta: 1 }).index).toBe(0);
    expect(jump(empty, { type: "move", delta: -1 }).index).toBe(0);
  });
});

describe("selected", () => {
  it("is nothing while the overlay is closed", () => {
    expect(selected(initialJump)).toBeNull();
  });

  it("is the first match on open, and follows the position", () => {
    const open = opened();
    expect(selected(open)?.id).toBe(ENTRIES[0].id);
    expect(selected(jump(open, { type: "move", delta: 1 }))?.id).toBe(
      ENTRIES[1].id,
    );
  });

  it("is nothing when the query matches no entry", () => {
    expect(selected(opened("zzzzqqq"))).toBeNull();
  });

  it("never reaches past the end of the filtered list", () => {
    expect(selected({ open: true, query: "zzzzqqq", index: 99 })).toBeNull();
    expect(selected({ open: true, query: "", index: 99 })).toBeNull();
  });
});
